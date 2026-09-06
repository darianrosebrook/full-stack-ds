@tool
class_name DSPopover
extends "res://addons/full_stack_ds/runtime/control.gd"

func _init() -> void:
	configuration = JSON.parse_string("{\"operation\":\"surface\",\"defaults\":{\"closeOnEscape\":\"true\",\"closeOnOutsideClick\":\"true\",\"closeOnBlur\":\"true\"},\"theme_color\":\"#141414\"}")
	label = "Popover"
