extends SceneTree
func _initialize() -> void:
	var path := "res://roundtrip.tscn"
	if OS.get_environment("FSDS_ROUNDTRIP") == "write":
		var node = load("res://addons/full_stack_ds/components/Switch/Switch.tscn").instantiate()
		node.label = "Saved in editor"
		var packed := PackedScene.new()
		assert(packed.pack(node) == OK)
		assert(ResourceSaver.save(packed, path) == OK)
		node.free()
	else:
		var node = load(path).instantiate()
		assert(node.label == "Saved in editor")
		assert(node.get_script().resource_path.ends_with("Switch.gd"))
		node.free()
	print("FSDS_ROUNDTRIP_OK")
	quit()
