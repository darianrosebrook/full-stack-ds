extends Control
var rows: Array = []
var failed := false
func check(condition: bool, message: String) -> void:
	if not condition:
		failed = true
		push_error(message)

func make_control(component: String):
	var scene = load("res://addons/full_stack_ds/components/%s/%s.tscn" % [component, component])
	return scene.instantiate()

func _ready() -> void:
	var trace = JSON.parse_string(FileAccess.get_file_as_string("res://traces.json"))
	for case in trace.cases:
		var control = make_control(case.component)
		add_child(control)
		control.controlled = case.get("controlled", false)
		if case.component in ["Accordion", "Tabs"]:
			control.collapsible = true
			for key in ["a", "b", "locked"]:
				var body := Label.new()
				body.text = "Panel " + key
				control.add_item(key, key, body, key == "locked")
		var states: Array = []
		for command in case.commands:
			match command.op:
				"activate": control.activate(command.get("value", ""))
				"disable": control.disabled = true
				"commit": control.value = command.value
			states.append(control.value)
		check(states == case.expected, "Trace mismatch: " + case.id)
		rows.append({"id":case.id,"states":states})
		control.queue_free()
		await get_tree().process_frame
	var probe = make_control("TokenProbe")
	add_child(probe)
	check(probe.theme.get_color("font_color", "Button").is_equal_approx(Color("#123456")), "Changed token did not reach Theme")
	probe.queue_free()
	var column := VBoxContainer.new()
	column.position = Vector2(24, 24)
	column.size.x = 580
	column.add_theme_constant_override("separation", 16)
	add_child(column)
	var heading := Label.new()
	heading.text = "Full Stack DS · Godot comparison"
	column.add_child(heading)
	for component in ["Switch", "Accordion", "Tabs", "Popover"]:
		var control = make_control(component)
		column.add_child(control)
		if component in ["Accordion", "Tabs"]:
			for key in ["Overview", "Inventory"]:
				var body := Label.new()
				body.text = "Your " + key.to_lower() + " content."
				control.add_item(key, key, body)
		elif component == "Popover":
			var body := Label.new()
			body.text = "Shared contract, Godot scene tree."
			control.content.add_child(body)
		var expected := Color(control.configuration.theme_color)
		check(control.theme.get_color("font_color", "Button").is_equal_approx(expected), "Theme projection mismatch")
	for i in range(5): await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var out := OS.get_environment("FSDS_ENGINE_OUT")
	if out.is_empty(): return
	get_viewport().get_texture().get_image().save_png(out.path_join("godot.png"))
	var file := FileAccess.open(out.path_join("godot.json"), FileAccess.WRITE)
	file.store_string(JSON.stringify({"runId":OS.get_environment("FSDS_ENGINE_RUN"),"engine":"godot","version":Engine.get_version_info().string,"exported":OS.has_feature("template"),"passed":not failed,"rows":rows}))
	file.close()
	get_tree().quit(1 if failed else 0)
