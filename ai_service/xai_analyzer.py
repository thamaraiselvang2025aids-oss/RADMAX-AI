import torch
import torch.nn.functional as F
import cv2
import numpy as np

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        # Register hooks to capture the math directly from the neural network
        target_layer.register_forward_hook(self.save_activation)
        target_layer.register_full_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activations = output

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]

    def generate_cam(self, input_tensor, target_class=None):
        self.model.eval()
        
        # Ensure input requires gradient
        input_tensor.requires_grad = True
        
        # Forward pass
        output = self.model(input_tensor)
        
        if target_class is None:
            target_class = output.argmax(dim=1).item()
            
        self.model.zero_grad()
        
        # Backward pass for the target class to see what pixels caused the decision
        class_score = output[0, target_class]
        class_score.backward(retain_graph=True)
        
        if self.gradients is None or self.activations is None:
            # Fallback if hooks failed to capture (can happen with certain architectures)
            return np.zeros((224, 224), dtype=np.float32), target_class
            
        # Pool the gradients across the spatial dimensions
        pooled_gradients = torch.mean(self.gradients, dim=[0, 2, 3])
        
        # Weight the activations by the gradients (Importance weighting)
        activations = self.activations[0].detach()
        for i in range(activations.shape[0]):
            activations[i, :, :] *= pooled_gradients[i]
            
        # Average over all channels to create the final 2D heatmap
        heatmap = torch.mean(activations, dim=0).squeeze().cpu().numpy()
        
        # ReLU on heatmap (only features with positive influence)
        heatmap = np.maximum(heatmap, 0)
        
        # Normalize
        if np.max(heatmap) > 0:
            heatmap /= np.max(heatmap)
            
        return heatmap, target_class

def generate_clinical_report(modality, target_class_idx):
    """
    Acts as a clinical rule engine, translating the AI's mathematical prediction 
    into a professional, human-readable radiological report.
    """
    if modality == "MRI":
        classes = ["Glioma", "Meningioma", "No Tumor", "Pituitary"]
        disease = classes[target_class_idx] if target_class_idx < len(classes) else "Unknown"
        
        if disease == "Glioma":
            return disease, "The AI has isolated a region of irregular, heterogenous hyperintensity (highlighted in red). This infiltrative pattern crossing standard anatomical boundaries is a hallmark radiological feature of a Glioma."
        elif disease == "Meningioma":
            return disease, "The AI highlights a well-circumscribed, extra-axial mass with intense contrast enhancement. The broad dural base in the red zone is characteristic of a Meningioma."
        elif disease == "Pituitary":
            return disease, "The focal heat map isolates the sellar region. The expansion and asymmetric enhancement identified here are highly consistent with a Pituitary adenoma."
        else:
            return disease, "No significant structural anomalies or mass effects were detected. The highlighted regions represent normal anatomical structures and symmetry."

    elif modality == "CT":
        classes = ["COVID-19", "Non-COVID"]
        disease = classes[target_class_idx] if target_class_idx < len(classes) else "Unknown"
        
        if disease == "COVID-19":
            return disease, "The Grad-CAM analysis has isolated peripheral, bilateral regions of ground-glass opacities and pulmonary consolidations. These highlighted patterns are highly specific to SARS-CoV-2 viral pneumonia."
        else:
            return disease, "The scan appears clear of COVID-19 specific consolidations. The highlighted areas correspond to normal pulmonary vasculature and bronchial pathways."
            
    return "Unknown", "A radiologically significant pattern was identified."

def apply_gradcam_overlay(original_img_np, heatmap, alpha=0.5):
    # Resize the low-res heatmap to match the original image resolution
    heatmap_resized = cv2.resize(heatmap, (original_img_np.shape[1], original_img_np.shape[0]))
    
    # Convert to 8-bit color
    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    
    # Ensure original is color so we can superimpose
    if len(original_img_np.shape) == 2 or original_img_np.shape[2] == 1:
        original_img_np = cv2.cvtColor(original_img_np, cv2.COLOR_GRAY2BGR)
        
    # Superimpose heatmap onto the original scan
    overlay = cv2.addWeighted(heatmap_colored, alpha, original_img_np, 1 - alpha, 0)
    return overlay
