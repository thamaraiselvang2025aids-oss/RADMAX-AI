import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import numpy as np

from torchvision.datasets import ImageFolder
import copy

# ==========================================
# CLINICAL TRANSFER LEARNING PIPELINE
# ==========================================
# This script fine-tunes the ImageNet-based ResNet18 (MRI) and DenseNet121 (CT)
# models on actual medical datasets using PyTorch's ImageFolder.

def get_medical_transforms():
    """
    Standard transformations for medical imagery.
    Data augmentation helps prevent overfitting on small medical datasets.
    """
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15), # Slight rotation, useful for scans
        transforms.ToTensor(),
        # Standard ImageNet Normalization (required for pre-trained weights)
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                             std=[0.229, 0.224, 0.225])
    ])

def train_model(data_dir, model_name="resnet18", epochs=5, batch_size=16):
    print(f"\n--- Starting Transfer Learning for {model_name.upper()} ---")
    
    # Select compute device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Load Dataset
    print(f"Loading dataset from: {data_dir}")
    transform = get_medical_transforms()
    
    try:
        dataset = ImageFolder(root=data_dir, transform=transform)
        dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        class_names = dataset.classes
        num_classes = len(class_names)
        print(f"Found {len(dataset)} images belonging to {num_classes} classes: {class_names}")
    except Exception as e:
        print(f"Failed to load dataset: {e}")
        return

    # 2. Load the Pre-trained Base Model
    if model_name == "resnet18":
        model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        # Replace the final classification layer for our specific medical classes
        num_ftrs = model.fc.in_features
        model.fc = nn.Linear(num_ftrs, num_classes)
        
    elif model_name == "densenet121":
        model = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT)
        num_ftrs = model.classifier.in_features
        model.classifier = nn.Linear(num_ftrs, num_classes)
    else:
        raise ValueError("Unsupported model architecture")

    model = model.to(device)

    # 3. Data is loaded, prepare Loss Function and Optimizer
    criterion = nn.CrossEntropyLoss()
    # We use a small learning rate because the base weights are already very good
    optimizer = optim.Adam(model.parameters(), lr=1e-4)

    # 4. Training Loop
    model.train()
    for epoch in range(epochs):
        running_loss = 0.0
        correct = 0
        total = 0
        
        for batch_idx, (inputs, labels) in enumerate(dataloader):
            inputs, labels = inputs.to(device), labels.to(device)

            # Zero gradients
            optimizer.zero_grad()

            # Forward pass
            outputs = model(inputs)
            loss = criterion(outputs, labels)

            # Backward pass & Optimize
            loss.backward()
            optimizer.step()

            # Calculate Accuracy
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
        epoch_loss = running_loss / len(dataloader)
        epoch_acc = 100. * correct / total
        print(f"Epoch [{epoch+1}/{epochs}] Loss: {epoch_loss:.4f} | Accuracy: {epoch_acc:.2f}%")

    # 5. Save the Fine-tuned Medical Model
    os.makedirs("models", exist_ok=True)
    if model_name == "resnet18":
        save_path = "models/brain_mri_finetuned.pth"
    else:
        save_path = "models/ct_scan_finetuned.pth"
        
    torch.save(model.state_dict(), save_path)
    print(f"Fine-tuned model successfully saved to {save_path}!")

if __name__ == "__main__":
    import sys
    print("Welcome to the Medical AI Transfer Learning Pipeline.")
    print("This script will adapt generic PyTorch models to recognize specific medical pathologies.")
    
    if len(sys.argv) < 3:
        print("\nUsage: python train_medical_models.py <path_to_dataset> <model_name>")
        print("Model Options: resnet18 (MRI) or densenet121 (CT)")
        print("Example: python train_medical_models.py /path/to/brain-tumor/Training resnet18")
        sys.exit(1)
        
    dataset_path = sys.argv[1]
    model_choice = sys.argv[2].lower()
    
    if model_choice not in ["resnet18", "densenet121"]:
        print("Error: Model must be 'resnet18' or 'densenet121'")
        sys.exit(1)
        
    train_model(data_dir=dataset_path, model_name=model_choice, epochs=3)
