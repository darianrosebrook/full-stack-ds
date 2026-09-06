@tool
class_name DSTabs
extends "res://addons/full_stack_ds/runtime/control.gd"

func _init() -> void:
	configuration = JSON.parse_string("{\"operation\":\"select\",\"defaults\":{\"orientation\":\"\\\"horizontal\\\"\",\"appearance\":\"\\\"underline\\\"\",\"activationMode\":\"\\\"automatic\\\"\",\"loop\":\"true\"},\"theme_color\":\"#141414\"}")
	label = "Tabs"
