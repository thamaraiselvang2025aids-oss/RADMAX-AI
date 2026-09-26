import os
import time
import subprocess

dataset_dir = r"C:\Users\Thamarai selvan\.cache\kagglehub\datasets\masoudnickparvar\brain-tumor-mri-dataset\2"

print("Waiting for dataset to finish downloading and extracting...")
# Wait for the base directory to exist
while not os.path.exists(dataset_dir):
    time.sleep(5)

# Give it some time to finish unzipping all files
time.sleep(20)

training_dir = None
# Find the exact 'Training' folder
for root, dirs, files in os.walk(dataset_dir):
    if "Training" in dirs:
        training_dir = os.path.join(root, "Training")
        break

if training_dir:
    print(f"\nFound Training directory at: {training_dir}")
    print("Starting Transfer Learning Pipeline...\n")
    # Run the training script!
    result = subprocess.run(["python", "train_medical_models.py", training_dir], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("ERRORS:")
        print(result.stderr)
else:
    print("Training directory not found in the downloaded dataset. Structure might be different.")
