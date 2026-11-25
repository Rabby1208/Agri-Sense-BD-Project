# pip install transformers
from transformers import AutoConfig

for name in ["neghani/plantvillage-mobilenetv2",
             "wambugu71/crop_leaf_diseases_vit"]:
    cfg = AutoConfig.from_pretrained(name)
    print(f"\n{name} ({len(cfg.id2label)} classes):")
    print(list(cfg.id2label.values()))