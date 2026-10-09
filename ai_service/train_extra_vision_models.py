import os
import shutil
import kagglehub
import torch
import torch.nn as nn
import torchvision.models as models
from torchvision.datasets import ImageFolder
import torchvision.transforms as transforms
from torch.utils.data import DataLoader

def get_transforms():
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

def download_dataset(kaggle_id, folder_name):
    print(f"\n--- Downloading {kaggle_id} from Kaggle ---")
    local_path = os.path.join("data", folder_name)
    if os.path.exists(local_path):
        print(f"Dataset already exists in {local_path}. Skipping download.")
        return local_path
    try:
        cache_path = kagglehub.dataset_download(kaggle_id)
        print(f"Copying to {local_path}...")
        shutil.copytree(cache_path, local_path)
        print(f"Successfully downloaded to {local_path}")
        return local_path
    except Exception as e:
        print(f"Failed to download {kaggle_id}: {e}")
        return None

def train_quick_model(data_dir, save_path, num_epochs=1):
    print(f"\n--- Training Model for {data_dir} ---")
    device = torch.device("cpu") # Keep it CPU for quick execution
    
    transform = get_transforms()
    try:
        # Search for inner directories if the dataset is nested
        img_dir = data_dir
        for root, dirs, files in os.walk(data_dir):
            if len(dirs) > 1:
                # Check if the directories actually contain images
                has_images = False
                for d in dirs:
                    d_path = os.path.join(root, d)
                    if any(f.lower().endswith(('.png', '.jpg', '.jpeg')) for f in os.listdir(d_path)):
                        has_images = True
                        break
                if has_images:
                    img_dir = root
                    break
        
        dataset = ImageFolder(root=img_dir, transform=transform)
        # We'll just train on a small subset (1 batch) to generate the weights quickly for the demo
        dataloader = DataLoader(dataset, batch_size=4, shuffle=True)
        class_names = dataset.classes
        print(f"Classes found: {class_names}")
        
        model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        num_ftrs = model.fc.in_features
        model.fc = nn.Linear(num_ftrs, len(class_names))
        model.to(device)
        
        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        
        model.train()
        for epoch in range(num_epochs):
            for i, (inputs, labels) in enumerate(dataloader):
                inputs, labels = inputs.to(device), labels.to(device)
                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                print(f"Epoch {epoch+1}/{num_epochs} - Batch {i+1} Loss: {loss.item():.4f}")
                break # Only process ONE batch for extremely fast simulated training
        
        os.makedirs("models", exist_ok=True)
        torch.save(model, save_path)
        print(f"Model saved to {save_path}")
        
    except Exception as e:
        print(f"Error training on {data_dir}: {e}")

if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    
    # 1. Breast Ultrasound
    breast_dir = download_dataset("aryashah2k/breast-ultrasound-images-dataset", "breast_ultrasound")
    if breast_dir:
        train_quick_model(breast_dir, os.path.join("models", "breast_ultrasound_resnet18.pth"))
    
    # 2. Thyroid Ultrasound
    # We use a known thyroid dataset
    thyroid_dir = download_dataset("vuppalaadithyasairam/thyroid-ultrasound-dataset", "thyroid_ultrasound")
    if thyroid_dir:
        train_quick_model(thyroid_dir, os.path.join("models", "thyroid_ultrasound_resnet18.pth"))

    # 3. Brain Stroke CT
    stroke_ct_dir = download_dataset("afridirahman/brain-stroke-ct-image-dataset", "image_stroke")
    if stroke_ct_dir:
        train_quick_model(stroke_ct_dir, os.path.join("models", "brain_stroke_resnet18.pth"))
    
    # 4. Fetal Ultrasound
    fetal_dir = download_dataset("orvile/ultrasound-fetus-dataset", "image_pregnancy")
    if fetal_dir:
        train_quick_model(fetal_dir, os.path.join("models", "fetal_ultrasound_resnet18.pth"))
