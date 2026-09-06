using System;
using System.Collections.Generic;
using System.IO;
using NUnit.Framework;
using UnityEditor;
using UnityEngine;
using UnityEngine.UIElements;
namespace FullStackDS.Tests {
public class EngineComparison {
    [Serializable] public class Command { public string op, value; }
    [Serializable] public class Case { public string id, component; public bool controlled; public Command[] commands; public string[] expected; }
    [Serializable] public class Traces { public Case[] cases; }
    [Serializable] public class Row { public string id; public string[] states; }
    [Serializable] public class Receipt { public string runId, engine = "unity"; public bool passed = true; public Row[] rows; }
    [Test] public void FrozenSemanticTraces() {
        var traces = JsonUtility.FromJson<Traces>(File.ReadAllText(Environment.GetEnvironmentVariable("FSDS_ENGINE_TRACES")));
        var window = ScriptableObject.CreateInstance<EditorWindow>(); window.Show();
        var rows = new List<Row>();
        try {
            foreach (var trace in traces.cases) {
                VisualElement control = trace.component == "Switch" ? new Switch() : trace.component == "Accordion" ? new Accordion { Collapsible = true } : trace.component == "Tabs" ? new Tabs() : new Popover();
                window.rootVisualElement.Add(control);
                if (control is BooleanControl boolean) boolean.Controlled = trace.controlled;
                if (control is ItemGroup group) {
                    group.Controlled = trace.controlled;
                    foreach (var key in new[] { "a", "b", "locked" }) group.AddItem(new SelectionItem { Value = key, Label = key, Disabled = key == "locked" });
                }
                var states = new List<string>();
                foreach (var command in trace.commands) {
                    if (command.op == "disable") control.SetEnabled(false);
                    else if (command.op == "commit") ((BooleanControl)control).value = command.value == "true";
                    else if (control is BooleanControl b) b.RequestValue(!b.value);
                    else if (control is ItemGroup g) { foreach (var item in g.Items) if (item.Value == command.value) g.Activate(item); }
                    else if (control is AnchoredSurface p) p.RequestValue(!p.value);
                    states.Add(control is BooleanControl bv ? bv.value.ToString().ToLowerInvariant() : control is ItemGroup gv ? gv.Value : ((AnchoredSurface)control).value.ToString().ToLowerInvariant());
                }
                CollectionAssert.AreEqual(trace.expected, states, trace.id);
                rows.Add(new Row { id = trace.id, states = states.ToArray() });
                control.RemoveFromHierarchy();
            }
            File.WriteAllText(Path.Combine(Environment.GetEnvironmentVariable("FSDS_ENGINE_OUT"), "unity.json"), JsonUtility.ToJson(new Receipt { runId = Environment.GetEnvironmentVariable("FSDS_ENGINE_RUN"), rows = rows.ToArray() },true));
        } finally { window.Close(); }
    }
}}
