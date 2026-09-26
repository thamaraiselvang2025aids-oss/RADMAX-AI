import os
import torch
import torch.nn as nn
from torchvision import models, transforms, datasets
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, accuracy_score

def evaluate_model():
    print("Loading Fine-Tuned ResNet18 MRI Model...")
    
    # 1. Prepare Model Architecture
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = models.resnet18()
    
    # Kaggle dataset has 4 classes: glioma, meningioma, notumor, pituitary
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, 4)
    
    # Load the fine-tuned weights
    weights_path = os.path.join("models", "brain_mri_finetuned.pth")
    if not os.path.exists(weights_path):
        print("Could not find weights at", weights_path)
        return
        
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model.to(device)
    model.eval()

    # 2. Prepare Testing Data
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Try Testing folder first, if not use Training
    data_dir = os.path.join("data", "brain_tumor_dataset")
    test_dir = os.path.join(data_dir, "Testing")
    if not os.path.exists(test_dir):
        test_dir = os.path.join(data_dir, "Training")
        print("Testing directory not found, running evaluation on Training data.")
    else:
        print("Found Testing directory, running evaluation on unseen test data.")

    dataset = datasets.ImageFolder(root=test_dir, transform=transform)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=False)
    
    print(f"Dataset Name: masoudnickparvar/brain-tumor-mri-dataset")
    print(f"Classes: {dataset.classes}")
    print(f"Total Test Images: {len(dataset)}")

    # 3. Run Inference and Collect Predictions
    all_preds = []
    all_labels = []
    
    print("\nRunning Inference (This may take a minute on CPU)...")
    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    # 4. Generate Classification Report
    acc = accuracy_score(all_labels, all_preds)
    print("\n" + "="*50)
    print(f"OVERALL ACCURACY: {acc * 100:.2f}%")
    print("="*50 + "\n")
    
    print("Detailed Clinical Metrics (Precision, Recall, F1-Score):")
    report = classification_report(all_labels, all_preds, target_names=dataset.classes)
    print(report)

if __name__ == "__main__":
    evaluate_model()
