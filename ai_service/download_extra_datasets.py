import os
import shutil
import kagglehub

def download_and_copy(kaggle_id, local_folder):
    print(f"\nDownloading {kaggle_id} from Kaggle...")
    try:
        cache_path = kagglehub.dataset_download(kaggle_id)
        local_path = os.path.join("data", local_folder)
        if not os.path.exists(local_path):
            print(f"Copying to local folder: {local_path} ...")
            shutil.copytree(cache_path, local_path)
            print(f"Successfully added to {local_folder}!")
        else:
            print(f"Dataset already exists in {local_folder}.")
    except Exception as e:
        print(f"Failed to download {kaggle_id}: {e}")

def main():
    os.makedirs("data", exist_ok=True)
    
    # 1. Tabular Stroke Dataset
    download_and_copy("fedesoriano/stroke-prediction-dataset", "tabular_stroke")
    
    # 2. Tabular Pregnancy (Fetal Health) Dataset
    download_and_copy("andrewmvd/fetal-health-classification", "tabular_pregnancy")
    
    # 3. Image Stroke Dataset (Brain CT)
    download_and_copy("afridirahman/brain-stroke-ct-image-dataset", "image_stroke")
    
    # 4. Image Pregnancy Dataset (Fetal Ultrasound)
    # Using a common fetal ultrasound dataset
    download_and_copy("orvile/ultrasound-fetus-dataset", "image_pregnancy")

if __name__ == "__main__":
    main()
