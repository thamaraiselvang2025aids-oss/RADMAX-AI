import os
import time
import subprocess

dataset_dir = r"C:\Users\Thamarai selvan\.cache\kagglehub\datasets\plameneduardo\sarscov2-ctscan-dataset"

print("Waiting for CT Scan dataset to finish downloading and extracting...")
# Wait for the base directory to exist
while not os.path.exists(dataset_dir):
    time.sleep(5)

# Give it some time to finish unzipping all files
time.sleep(20)

# The dataset is usually unzipped inside a version folder, let's find the root with images
training_dir = None
for root, dirs, files in os.walk(dataset_dir):
    # This specific dataset has 'COVID' and 'non-COVID' folders
    if "COVID" in dirs and "non-COVID" in dirs:
        training_dir = root
        break

if training_dir:
    print(f"\nFound CT dataset directory at: {training_dir}")
    print("Starting Transfer Learning Pipeline for CT Scan (DenseNet121)...\n")
    
    # Run the training script!
    result = subprocess.run(["python", "train_medical_models.py", training_dir, "densenet121"], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("ERRORS:")
        print(result.stderr)
else:
    print("Dataset directory structure not recognized.")
