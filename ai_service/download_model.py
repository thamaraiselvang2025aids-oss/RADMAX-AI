import os
import urllib.request
import torch
import torchvision.models as models
import kagglehub
import shutil

def download_and_save_model():
    print("Downloading DenseNet121 (Chest X-Ray) weights directly...")
    xray_url = "https://github.com/mlmed/torchxrayvision/releases/download/v1/nih-pc-chex-mimic_ch-google-openi-kaggle-densenet121-d121-tw-lr001-rot45-tr15-sc15-seed0-best.pt"
    
    os.makedirs("models", exist_ok=True)
    xray_path = os.path.join("models", "densenet121-res224-all.pth")
    if not os.path.exists(xray_path):
        urllib.request.urlretrieve(xray_url, xray_path)
        print(f"X-Ray model weights saved to {xray_path}")
    else:
        print(f"X-Ray model already exists at {xray_path}")

    print("Downloading ResNet18 (Brain MRI Base) weights...")
    mri_model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    mri_path = os.path.join("models", "brain_mri_resnet18.pth")
    torch.save(mri_model.state_dict(), mri_path)
    print(f"Brain MRI model weights saved to {mri_path}")

    print("Downloading DenseNet121 (CT Scan Base) weights...")
    ct_model = models.densenet121(weights=models.DenseNet121_Weights.DEFAULT)
    ct_path = os.path.join("models", "ct_scan_densenet121.pth")
    torch.save(ct_model.state_dict(), ct_path)
    print(f"CT Scan model weights saved to {ct_path}")

    print("\nDownloading Brain Tumor MRI Dataset from Kaggle...")
    try:
        dataset_cache_path = kagglehub.dataset_download("masoudnickparvar/brain-tumor-mri-dataset")
        local_dataset_path = os.path.join("data", "brain_tumor_dataset")
        if not os.path.exists(local_dataset_path):
            print(f"Copying MRI dataset to our local folder: {local_dataset_path} ...")
            shutil.copytree(dataset_cache_path, local_dataset_path)
            print("MRI Dataset successfully added to our folder!")
        else:
            print("MRI Dataset already exists in our local folder.")
    except Exception as e:
        print(f"Failed to download MRI dataset: {e}")

    print("\nDownloading SARS-CoV-2 CT-Scan Dataset from Kaggle...")
    try:
        ct_cache_path = kagglehub.dataset_download("plameneduardo/sarscov2-ctscan-dataset")
        local_ct_path = os.path.join("data", "ct_scan_dataset")
        if not os.path.exists(local_ct_path):
            print(f"Copying CT dataset to our local folder: {local_ct_path} ...")
            shutil.copytree(ct_cache_path, local_ct_path)
            print("CT Dataset successfully added to our folder!")
        else:
            print("CT Dataset already exists in our local folder.")
    except Exception as e:
        print(f"Failed to download CT dataset: {e}")

if __name__ == "__main__":
    download_and_save_model()
