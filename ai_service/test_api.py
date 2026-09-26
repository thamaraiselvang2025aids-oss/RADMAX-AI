import os
import requests
import base64

def test_inference_api():
    # Find a test image from our Kaggle dataset
    test_dir = os.path.join("data", "brain_tumor_dataset", "Testing", "glioma")
    if not os.path.exists(test_dir):
        print("Error: Could not find test images directory.")
        return
        
    test_images = os.listdir(test_dir)
    if not test_images:
        print("Error: No images found in test directory.")
        return
        
    test_image_path = os.path.join(test_dir, test_images[0])
    print(f"Testing API with image: {test_image_path}")
    
    url = "http://localhost:8001/api/v1/inference"
    
    # We must send the image as a multipart/form-data request
    with open(test_image_path, "rb") as f:
        files = {"file": (os.path.basename(test_image_path), f, "image/jpeg")}
        data = {
            "modality": "MRI",
            "bodyPart": "Brain"
        }
        
        print(f"Sending POST request to {url}...")
        try:
            response = requests.post(url, files=files, data=data)
            response.raise_for_status()
            
            result = response.json()
            print("\n" + "="*50)
            print("API RESPONSE RECEIVED SUCCESSULLY!")
            print("="*50)
            print(f"Detected Disease: {result['diseasesDetected'][0]['disease']}")
            print(f"Confidence Score: {result['confidenceScore']}%")
            print(f"Emergency Priority: {result['emergencyPriority']}")
            print(f"Clinical AI Findings:\n{result['aiFindings']}")
            
            # Extract and save the Base64 Heatmap Overlay
            b64_string = result.get("heatmapOverlayUrl", "")
            if b64_string.startswith("data:image/png;base64,"):
                b64_string = b64_string.replace("data:image/png;base64,", "")
                
            heatmap_bytes = base64.b64decode(b64_string)
            
            output_file = "gradcam_test_result.png"
            with open(output_file, "wb") as out_f:
                out_f.write(heatmap_bytes)
                
            print(f"\n=> SUCCESS! The Grad-CAM heatmap has been saved to: {os.path.abspath(output_file)}")
            print("Open this file in your file explorer to see the AI highlighting the tumor!")
            
        except Exception as e:
            print(f"API Request Failed: {e}")

if __name__ == "__main__":
    test_inference_api()
