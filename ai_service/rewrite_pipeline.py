import os, re

path = 'pipeline.py'
with open(path, 'r') as f:
    code = f.read()

# Remove the model loading from __init__
init_pattern = r'self\.clahe = cv2\.createCLAHE\(clipLimit=2\.0, tileGridSize=\(8, 8\)\).*?def preprocess_image'
init_replacement = '''self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        self.model_dir = os.path.join(os.path.dirname(__file__), "models")

    def _load_mri(self):
        m = models.resnet18(weights=None)
        m.fc = torch.nn.Linear(m.fc.in_features, 4)
        m.load_state_dict(torch.load(os.path.join(self.model_dir, "brain_mri_finetuned.pth"), map_location="cpu", weights_only=False))
        m.eval()
        return m

    def _load_ct(self):
        m = models.densenet121(weights=None)
        m.classifier = torch.nn.Linear(m.classifier.in_features, 2)
        m.load_state_dict(torch.load(os.path.join(self.model_dir, "ct_scan_finetuned.pth"), map_location="cpu", weights_only=False))
        m.eval()
        return m
        
    def _load_breast(self):
        m = torch.load(os.path.join(self.model_dir, "breast_ultrasound_resnet18.pth"), map_location="cpu", weights_only=False)
        m.eval()
        return m
        
    def _load_thyroid(self):
        m = torch.load(os.path.join(self.model_dir, "thyroid_ultrasound_resnet18.pth"), map_location="cpu", weights_only=False)
        m.eval()
        return m
        
    def _load_stroke(self):
        m = torch.load(os.path.join(self.model_dir, "brain_stroke_resnet18.pth"), map_location="cpu", weights_only=False)
        m.eval()
        return m
        
    def _load_pregnancy(self):
        m = torch.load(os.path.join(self.model_dir, "fetal_ultrasound_resnet18.pth"), map_location="cpu", weights_only=False)
        m.eval()
        return m
        
    def _load_xrv(self):
        m = torch.load(os.path.join(self.model_dir, "densenet121-res224-all.pth"), map_location="cpu", weights_only=False)
        m.eval()
        return m

    def preprocess_image'''

code = re.sub(init_pattern, init_replacement, code, flags=re.DOTALL)

code = code.replace('if self.xrv_model is not None', 'xrv_model = self._load_xrv()\n        if xrv_model is not None')
code = code.replace('self.xrv_model.pathologies', 'xrv_model.pathologies')
code = code.replace('preds = self.xrv_model(img_tensor)[0]', 'preds = xrv_model(img_tensor)[0]')

code = code.replace('if not diseases and ("brain" in body_lower or "mri" in modality.lower()) and self.mri_model is not None:', 'mri_model = self._load_mri()\n        if not diseases and ("brain" in body_lower or "mri" in modality.lower()) and mri_model is not None:')
code = code.replace('self.mri_model, self.mri_model.layer4[-1]', 'mri_model, mri_model.layer4[-1]')
code = code.replace('preds = self.mri_model(img_tensor)', 'preds = mri_model(img_tensor)')

code = code.replace('if not diseases and "ct" in modality.lower() and self.ct_model is not None:', 'ct_model = self._load_ct()\n        if not diseases and "ct" in modality.lower() and ct_model is not None:')
code = code.replace('self.ct_model, self.ct_model.features', 'ct_model, ct_model.features')
code = code.replace('preds = self.ct_model(img_tensor)', 'preds = ct_model(img_tensor)')

code = code.replace('if not diseases and ("ultrasound" in modality.lower() or "us" in modality.lower()) and "breast" in body_lower and self.breast_model is not None:', 'breast_model = self._load_breast()\n        if not diseases and ("ultrasound" in modality.lower() or "us" in modality.lower()) and "breast" in body_lower and breast_model is not None:')
code = code.replace('self.breast_model, self.breast_model.layer4', 'breast_model, breast_model.layer4')
code = code.replace('preds = self.breast_model(img_tensor)', 'preds = breast_model(img_tensor)')

code = code.replace('if not diseases and ("ultrasound" in modality.lower() or "us" in modality.lower()) and "thyroid" in body_lower and self.thyroid_model is not None:', 'thyroid_model = self._load_thyroid()\n        if not diseases and ("ultrasound" in modality.lower() or "us" in modality.lower()) and "thyroid" in body_lower and thyroid_model is not None:')
code = code.replace('self.thyroid_model, self.thyroid_model.layer4', 'thyroid_model, thyroid_model.layer4')
code = code.replace('preds = self.thyroid_model(img_tensor)', 'preds = thyroid_model(img_tensor)')

with open(path, 'w') as f:
    f.write(code)
print('Updated pipeline.py')
