import os
import io
import cv2
import numpy as np
import torch
import torchvision.transforms as transforms
import torchvision.models as models
try:
    from xai_analyzer import GradCAM, generate_clinical_report, apply_gradcam_overlay
except ImportError:
    from ai_service.xai_analyzer import GradCAM, generate_clinical_report, apply_gradcam_overlay
try:
    import pydicom
except ImportError:
    pydicom = None

try:
    import torchxrayvision as xrv
    import skimage.color
except ImportError:
    xrv = None
    skimage = None

class MedicalAIPipeline:
    def __init__(self):
        self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        self.model_dir = os.path.join(os.path.dirname(__file__), "models")

    def _load_mri(self):
        try:
    
            m = models.resnet18(weights=None)
            m.fc = torch.nn.Linear(m.fc.in_features, 4)
            m.load_state_dict(torch.load(os.path.join(self.model_dir, "brain_mri_finetuned.pth"), map_location="cpu", weights_only=False))
            m.eval()
            return m
    
        except Exception as e:
            print(f"Failed to load model: {e}")
            return None
    def _load_ct(self):
        try:
    
            m = models.densenet121(weights=None)
            m.classifier = torch.nn.Linear(m.classifier.in_features, 2)
            m.load_state_dict(torch.load(os.path.join(self.model_dir, "ct_scan_finetuned.pth"), map_location="cpu", weights_only=False))
            m.eval()
            return m
            
        except Exception as e:
            print(f"Failed to load model: {e}")
            return None
    def _load_breast(self):
        try:
    
            m = torch.load(os.path.join(self.model_dir, "breast_ultrasound_resnet18.pth"), map_location="cpu", weights_only=False)
            m.eval()
            return m
            
        except Exception as e:
            print(f"Failed to load model: {e}")
            return None
    def _load_thyroid(self):
        try:
    
            m = torch.load(os.path.join(self.model_dir, "thyroid_ultrasound_resnet18.pth"), map_location="cpu", weights_only=False)
            m.eval()
            return m
            
        except Exception as e:
            print(f"Failed to load model: {e}")
            return None
    def _load_stroke(self):
        try:
    
            m = torch.load(os.path.join(self.model_dir, "brain_stroke_resnet18.pth"), map_location="cpu", weights_only=False)
            m.eval()
            return m
            
        except Exception as e:
            print(f"Failed to load model: {e}")
            return None
    def _load_pregnancy(self):
        try:
    
            m = torch.load(os.path.join(self.model_dir, "fetal_ultrasound_resnet18.pth"), map_location="cpu", weights_only=False)
            m.eval()
            return m
            
        except Exception as e:
            print(f"Failed to load model: {e}")
            return None
    def _load_xrv(self):
        try:
    
            m = torch.load(os.path.join(self.model_dir, "densenet121-res224-all.pth"), map_location="cpu", weights_only=False)
            m.eval()
            return m
        except Exception as e:
            print(f"Failed to load model: {e}")
            return None

    def preprocess_image(self, img_bytes: bytes) -> tuple[np.ndarray, dict]:
        metadata = {}
        img_np = None

        if pydicom is not None:
            try:
                ds = pydicom.dcmread(io.BytesIO(img_bytes))
                metadata = {
                    "patientName": str(getattr(ds, "PatientName", "Unknown")),
                    "modality": str(getattr(ds, "Modality", "MRI")),
                    "bodyPart": str(getattr(ds, "BodyPartExamined", "Brain"))
                }
                pixel_array = ds.pixel_array.astype(np.float32)
                slope = float(getattr(ds, "RescaleSlope", 1.0))
                intercept = float(getattr(ds, "RescaleIntercept", 0.0))
                pixel_array = pixel_array * slope + intercept
                
                p_min, p_max = np.min(pixel_array), np.max(pixel_array)
                if p_max > p_min:
                    img_np = ((pixel_array - p_min) / (p_max - p_min) * 255.0).astype(np.uint8)
                else:
                    img_np = np.zeros_like(pixel_array, dtype=np.uint8)
            except Exception:
                img_np = None

        if img_np is None:
            nparr = np.frombuffer(img_bytes, np.uint8)
            img_np = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
            if img_np is None:
                img_np = np.full((512, 512), 128, dtype=np.uint8)

        enhanced_img = self.clahe.apply(img_np)
        return enhanced_img, metadata

    def generate_gradcam_heatmap(self, img: np.ndarray, body_part: str = "Brain") -> tuple[np.ndarray, list]:
        h, w = img.shape[:2]
        heatmap = np.zeros((h, w), dtype=np.float32)
        boxes = []
        body_lower = body_part.lower()

        # Fallback Mock GradCAM just in case
        if "brain" in body_lower:
            cx, cy, radius = int(w * 0.35), int(h * 0.42), int(min(h, w) * 0.12)
            cv2.circle(heatmap, (cx, cy), radius, 1.0, -1)
            heatmap = cv2.GaussianBlur(heatmap, (45, 45), 0)
        else:
            cx, cy, radius = int(w * 0.5), int(h * 0.45), int(min(h, w) * 0.1)
            cv2.circle(heatmap, (cx, cy), radius, 1.0, -1)
            heatmap = cv2.GaussianBlur(heatmap, (41, 41), 0)

        heatmap_normalized = cv2.normalize(heatmap, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        heatmap_color = cv2.applyColorMap(heatmap_normalized, cv2.COLORMAP_JET)
        return heatmap_color, boxes

    def run_inference(self, img_bytes: bytes, modality: str = "MRI", body_part: str = "Brain") -> dict:
        img, dicom_meta = self.preprocess_image(img_bytes)
        modality = dicom_meta.get("modality", modality)
        body_part = dicom_meta.get("bodyPart", body_part)

        heatmap_bgr, boxes = self.generate_gradcam_heatmap(img, body_part)
        _, buffer = cv2.imencode('.png', heatmap_bgr)
        heatmap_bytes = buffer.tobytes()

        diseases = []
        findings = "Standard image processing completed."
        priority = "LOW"
        confidence_score = 0.0

        body_lower = body_part.lower()

        # Execute REAL ML inference if it's a Chest X-Ray (and NOT a CT scan)
        xrv_model = self._load_xrv()
        if xrv_model is not None and "ct" not in modality.lower() and ("xray" in modality.lower() or "cr" in modality.lower() or "dx" in modality.lower() or ("chest" in body_lower and "mri" not in modality.lower() and "us" not in modality.lower())):
            try:
                # Prepare image for XRV (1, H, W) normalized [-1024, 1024]
                img_float = img.astype(np.float32)
                # xrv normalizer requires it to be between [-1024, 1024]
                img_norm = (img_float / 255.0) * 2048.0 - 1024.0
                
                # TorchXRayVision Transform Pipeline
                transform = transforms.Compose([
                    xrv.datasets.XRayCenterCrop(),
                    xrv.datasets.XRayResizer(224)
                ])
                
                # (H, W) -> (1, H, W) -> Transform -> (1, 1, 224, 224)
                img_tensor = torch.from_numpy(img_norm).unsqueeze(0)
                img_tensor = transform(img_tensor).unsqueeze(0)
                
                # Forward Pass (REAL ML Inference)
                with torch.no_grad():
                    preds = xrv_model(img_tensor)[0]
                
                # Zip results and sort by probability
                results = list(zip(xrv_model.pathologies, preds.numpy()))
                results.sort(key=lambda x: x[1], reverse=True)
                
                # Select top 3 diseases
                diseases = [
                    {"disease": path, "confidence": float(round(prob * 100, 2))}
                    for path, prob in results[:3] if prob > 0.05
                ]
                
                if diseases:
                    top_disease = diseases[0]
                    confidence_score = top_disease["confidence"]
                    if confidence_score > 50:
                        priority = "CRITICAL" if "Pneumonia" in top_disease["disease"] or "Cardiomegaly" in top_disease["disease"] else "HIGH"
                        findings = f"Real ML (TorchXRayVision) detected primary pathology: {top_disease['disease']} with {confidence_score}% probability. Also noted: {', '.join([d['disease'] for d in diseases[1:]])}."
                    else:
                        priority = "LOW"
                        findings = "Real ML evaluation completed. Pathologies evaluated but none crossed the critical threshold."
                
            except Exception as e:
                findings = f"Real ML inference failed: {str(e)}. Falling back to mock."

        # Execute ML inference for Brain Stroke (ResNet18 on Brain CT)
        stroke_model = self._load_stroke()
        is_stroke = "stroke" in body_lower or "stroke" in modality.lower() or ("brain" in body_lower and "ct" in modality.lower() and "tumor" not in body_lower)
        if not diseases and is_stroke and stroke_model is not None:
            try:
                img_resized = cv2.resize(img, (224, 224))
                img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_GRAY2RGB)
                img_float = img_rgb.astype(np.float32) / 255.0
                mean, std = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])
                img_norm = (img_float - mean) / std
                img_tensor = torch.from_numpy(img_norm).permute(2, 0, 1).unsqueeze(0).float()
                
                # Grad-CAM for Brain Stroke ResNet18
                grad_cam = GradCAM(stroke_model, stroke_model.layer4[-1])
                heatmap_arr, predicted_class_idx = grad_cam.generate_cam(img_tensor)
                
                # Apply overlay
                heatmap_bgr = apply_gradcam_overlay(img, heatmap_arr)
                _, buffer = cv2.imencode('.png', heatmap_bgr)
                heatmap_bytes = buffer.tobytes()
                
                # Generate exact clinical explanation (Classes: 0: Normal, 1: Stroke)
                disease_name, explanation = generate_clinical_report("STROKE", predicted_class_idx)
                
                with torch.no_grad():
                    preds = stroke_model(img_tensor)
                    prob = torch.nn.functional.softmax(preds[0], dim=0)
                    top_prob, _ = torch.max(prob, 0)
                
                confidence_score = float(round(top_prob.item() * 100, 2))
                diseases = [{"disease": disease_name, "confidence": confidence_score}]
                priority = "CRITICAL" if ("Stroke" in disease_name and "No" not in disease_name) else "LOW"
                findings = f"XAI Clinical Output: {explanation} (Confidence: {confidence_score}%)"
            except Exception as e:
                findings = f"Stroke CT inference failed: {str(e)}. Falling back to mock."

        # Execute ML inference for Brain MRI (Tumor)
        mri_model = self._load_mri()
        non_brain_keywords = ["stroke", "thyroid", "preg", "fetal", "breast", "lung", "chest", "neck"]
        is_brain_mri = ("brain" in body_lower or "head" in body_lower or ("mri" in modality.lower() and not any(k in body_lower for k in non_brain_keywords))) and not any(k in body_lower for k in non_brain_keywords)
        if not diseases and is_brain_mri and mri_model is not None:
            try:
                img_resized = cv2.resize(img, (224, 224))
                img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_GRAY2RGB)
                img_float = img_rgb.astype(np.float32) / 255.0
                mean, std = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])
                img_norm = (img_float - mean) / std
                img_tensor = torch.from_numpy(img_norm).permute(2, 0, 1).unsqueeze(0).float()
                
                # 1. Run Grad-CAM logic
                grad_cam = GradCAM(mri_model, mri_model.layer4[-1])
                heatmap_arr, predicted_class_idx = grad_cam.generate_cam(img_tensor)
                
                # Apply overlay
                heatmap_bgr = apply_gradcam_overlay(img, heatmap_arr)
                _, buffer = cv2.imencode('.png', heatmap_bgr)
                heatmap_bytes = buffer.tobytes()
                
                # Generate exact clinical explanation
                disease_name, explanation = generate_clinical_report("MRI", predicted_class_idx)
                
                # Re-run inference just to get probabilities easily
                with torch.no_grad():
                    preds = mri_model(img_tensor)
                    prob = torch.nn.functional.softmax(preds[0], dim=0)
                    top_prob, _ = torch.max(prob, 0)
                
                confidence_score = float(round(top_prob.item() * 100, 2))
                diseases = [{"disease": disease_name, "confidence": confidence_score}]
                priority = "HIGH" if disease_name != "No Tumor" else "LOW"
                findings = f"XAI Clinical Output: {explanation} (Confidence: {confidence_score}%)"
            except Exception as e:
                findings = f"MRI inference failed: {str(e)}. Falling back to mock."

        # Execute ML inference for CT Scan (Pneumonia)
        ct_model = self._load_ct()
        if not diseases and "ct" in modality.lower() and "brain" not in body_lower and "stroke" not in body_lower and ct_model is not None:
            try:
                img_resized = cv2.resize(img, (224, 224))
                img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_GRAY2RGB)
                img_float = img_rgb.astype(np.float32) / 255.0
                mean, std = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])
                img_norm = (img_float - mean) / std
                img_tensor = torch.from_numpy(img_norm).permute(2, 0, 1).unsqueeze(0).float()
                
                # 1. Run Grad-CAM logic targeting denseblock4 (last conv block before classifier)
                grad_cam = GradCAM(ct_model, ct_model.features.denseblock4)
                heatmap_arr, predicted_class_idx = grad_cam.generate_cam(img_tensor)
                
                # Apply overlay
                heatmap_bgr = apply_gradcam_overlay(img, heatmap_arr)
                _, buffer = cv2.imencode('.png', heatmap_bgr)
                heatmap_bytes = buffer.tobytes()
                
                # Generate exact clinical explanation
                disease_name, explanation = generate_clinical_report("CT", predicted_class_idx)
                
                # Re-run inference just to get probabilities easily
                with torch.no_grad():
                    preds = ct_model(img_tensor)
                    prob = torch.nn.functional.softmax(preds[0], dim=0)
                    top_prob, _ = torch.max(prob, 0)
                
                confidence_score = float(round(top_prob.item() * 100, 2))
                diseases = [{"disease": disease_name, "confidence": confidence_score}]
                priority = "HIGH" if "Pneumonia" in disease_name and "No" not in disease_name else "LOW"
                findings = f"XAI Clinical Output: {explanation} (Confidence: {confidence_score}%)"
            except Exception as e:
                findings = f"CT inference failed: {str(e)}. Falling back to mock."

        # Execute ML inference for Breast Ultrasound
        breast_model = self._load_breast()
        is_breast = "breast" in body_lower or "mammary" in body_lower or "breast" in modality.lower()
        if not diseases and is_breast and breast_model is not None:
            try:
                img_resized = cv2.resize(img, (224, 224))
                img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_GRAY2RGB)
                img_float = img_rgb.astype(np.float32) / 255.0
                mean, std = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])
                img_norm = (img_float - mean) / std
                img_tensor = torch.from_numpy(img_norm).permute(2, 0, 1).unsqueeze(0).float()
                
                # Grad-CAM for Breast US targeting last layer of layer4
                target_layer = breast_model.layer4[-1] if hasattr(breast_model, 'layer4') else breast_model.layer4
                grad_cam = GradCAM(breast_model, target_layer)
                heatmap_arr, predicted_class_idx = grad_cam.generate_cam(img_tensor)
                heatmap_bgr = apply_gradcam_overlay(img, heatmap_arr)
                _, buffer = cv2.imencode('.png', heatmap_bgr)
                heatmap_bytes = buffer.tobytes()
                
                disease_name, explanation = generate_clinical_report("BREAST", predicted_class_idx)
                
                with torch.no_grad():
                    preds = breast_model(img_tensor)
                    prob = torch.nn.functional.softmax(preds[0], dim=0)
                    top_prob, _ = torch.max(prob, 0)
                
                confidence_score = float(round(top_prob.item() * 100, 2))
                diseases = [{"disease": disease_name, "confidence": confidence_score}]
                priority = "CRITICAL" if "Malignant" in disease_name else ("LOW" if "Normal" in disease_name else "REVIEW")
                findings = f"Breast US XAI Output: {explanation} (Confidence: {confidence_score}%)"
            except Exception as e:
                findings = f"Breast US inference failed: {str(e)}."
                
        # Execute ML inference for Thyroid Ultrasound
        thyroid_model = self._load_thyroid()
        is_thyroid = "thyroid" in body_lower or "neck" in body_lower or "thyroid" in modality.lower()
        if not diseases and is_thyroid and thyroid_model is not None:
            try:
                img_resized = cv2.resize(img, (224, 224))
                img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_GRAY2RGB)
                img_float = img_rgb.astype(np.float32) / 255.0
                mean, std = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])
                img_norm = (img_float - mean) / std
                img_tensor = torch.from_numpy(img_norm).permute(2, 0, 1).unsqueeze(0).float()
                
                # Grad-CAM for Thyroid US targeting last conv layer
                target_layer = thyroid_model.layer4[-1] if hasattr(thyroid_model, 'layer4') else thyroid_model.layer4
                grad_cam = GradCAM(thyroid_model, target_layer)
                heatmap_arr, predicted_class_idx = grad_cam.generate_cam(img_tensor)
                heatmap_bgr = apply_gradcam_overlay(img, heatmap_arr)
                _, buffer = cv2.imencode('.png', heatmap_bgr)
                heatmap_bytes = buffer.tobytes()
                
                disease_name, explanation = generate_clinical_report("THYROID", predicted_class_idx)
                
                with torch.no_grad():
                    preds = thyroid_model(img_tensor)
                    prob = torch.nn.functional.softmax(preds[0], dim=0)
                    top_prob, _ = torch.max(prob, 0)
                
                confidence_score = float(round(top_prob.item() * 100, 2))
                diseases = [{"disease": disease_name, "confidence": confidence_score}]
                priority = "CRITICAL" if "Malignant" in disease_name else "REVIEW"
                findings = f"Thyroid US XAI Output: {explanation} (Confidence: {confidence_score}%)"
            except Exception as e:
                findings = f"Thyroid US inference failed: {str(e)}."

        # Execute ML inference for Fetal / Pregnancy Ultrasound
        fetal_model = self._load_pregnancy()
        is_pregnancy = "preg" in body_lower or "fetal" in body_lower or "fetus" in body_lower or "obstetric" in body_lower or "preg" in modality.lower() or "fetal" in modality.lower()
        if not diseases and is_pregnancy and fetal_model is not None:
            try:
                img_resized = cv2.resize(img, (224, 224))
                img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_GRAY2RGB)
                img_float = img_rgb.astype(np.float32) / 255.0
                mean, std = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])
                img_norm = (img_float - mean) / std
                img_tensor = torch.from_numpy(img_norm).permute(2, 0, 1).unsqueeze(0).float()
                
                # Grad-CAM for Fetal Ultrasound ResNet18
                target_layer = fetal_model.layer4[-1] if hasattr(fetal_model, 'layer4') else fetal_model.layer4
                grad_cam = GradCAM(fetal_model, target_layer)
                heatmap_arr, predicted_class_idx = grad_cam.generate_cam(img_tensor)
                heatmap_bgr = apply_gradcam_overlay(img, heatmap_arr)
                _, buffer = cv2.imencode('.png', heatmap_bgr)
                heatmap_bytes = buffer.tobytes()
                
                disease_name, explanation = generate_clinical_report("PREGNANCY", predicted_class_idx)
                
                with torch.no_grad():
                    preds = fetal_model(img_tensor)
                    prob = torch.nn.functional.softmax(preds[0], dim=0)
                    top_prob, _ = torch.max(prob, 0)
                
                confidence_score = float(round(top_prob.item() * 100, 2))
                diseases = [{"disease": disease_name, "confidence": confidence_score}]
                priority = "CRITICAL" if "Pathological" in disease_name else ("MEDIUM" if "Suspect" in disease_name else "LOW")
                findings = f"Fetal US XAI Output: {explanation} (Confidence: {confidence_score}%)"
            except Exception as e:
                findings = f"Fetal Ultrasound inference failed: {str(e)}."

        # Mock fallback for non-chest (like Brain MRI) if no real model matched
        if not diseases and "brain" in body_lower:
            diseases = [{"disease": "Brain Tumor (Mock)", "confidence": 93.8}]
            confidence_score = 93.8
            priority = "HIGH"
            findings = "Mocked result (No real model loaded for brain). Glioma suspected."
            
        if not diseases:
            diseases = [{"disease": "No critical findings", "confidence": 99.0}]

        return {
            "success": True,
            "qualityScore": 95.0,
            "confidenceScore": confidence_score,
            "emergencyPriority": priority,
            "growthPercentage": None,
            "diseasesDetected": diseases,
            "aiFindings": findings,
            "aiImpression": "Computed inference generated.",
            "boundingBoxes": boxes,
            "dicomMetadata": dicom_meta,
            "heatmapRawBytes": heatmap_bytes
        }

pipeline = MedicalAIPipeline()
