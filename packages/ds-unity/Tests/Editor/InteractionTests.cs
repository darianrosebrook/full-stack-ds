using System;
using System.Collections;
using System.Linq;
using NUnit.Framework;
using UnityEditor;
using UnityEngine;
using UnityEngine.TestTools;
using UnityEngine.UIElements;

namespace FullStackDS.Tests
{
    public class InteractionTests
    {
        private EditorWindow window;
        [SetUp] public void Setup()
        {
            window = ScriptableObject.CreateInstance<EditorWindow>();
            window.position = new Rect(0, 0, 600, 600); window.Show();
        }
        [TearDown] public void Teardown() => window.Close();
        private T Mount<T>(T element) where T : VisualElement { window.rootVisualElement.Add(element); return element; }
        private static void Submit(Button button)
        {
            using (var evt = NavigationSubmitEvent.GetPooled()) { evt.target = button; button.SendEvent(evt); }
        }
        private static void Key(VisualElement target, KeyCode key)
        {
            using (var evt = KeyDownEvent.GetPooled(new Event { type = EventType.KeyDown, keyCode = key })) {
                evt.target = target; target.SendEvent(evt);
            }
        }
        private static TabsItem Tab(string value, bool disabled = false)
        {
            var item = new TabsItem { Value = value, Label = value, Disabled = disabled };
            item.Add(new Label("Content " + value)); return item;
        }
        private static AccordionItem Section(string value)
        {
            var item = new AccordionItem { Value = value, Label = value };
            item.Add(new Label("Content " + value)); return item;
        }
        [Test] public void SwitchActivationChangesValueExactlyOnceAndSilentSetterDoesNotNotify()
        {
            var control = Mount(new Switch());
            int count = 0; bool observed = false;
            control.RegisterValueChangedCallback(e => { count++; observed = e.newValue; });
            Submit(control.Trigger);
            Assert.That(control.Checked, Is.True); Assert.That(observed, Is.True); Assert.That(count, Is.EqualTo(1));
            control.SetValueWithoutNotify(false);
            Assert.That(control.Checked, Is.False); Assert.That(count, Is.EqualTo(1));
            control.Disabled = true; Submit(control.Trigger);
            Assert.That(control.Checked, Is.False); Assert.That(count, Is.EqualTo(1));
        }
        [Test] public void ControlledSwitchRequestsWithoutChangingUntilOwnerCommits()
        {
            var control = Mount(new Switch { Controlled = true });
            bool? request = null; control.ValueRequested += v => request = v;
            Submit(control.Trigger);
            Assert.That(request, Is.True); Assert.That(control.Checked, Is.False);
            control.Checked = true; Assert.That(control.Checked, Is.True);
        }
        [Test] public void AccordionSingleSelectionHonorsCollapsibleAndDisabled()
        {
            var root = Mount(new Accordion()); var a = Section("a"); var b = Section("b");
            root.AddItem(a); root.AddItem(b);
            Submit(a.Trigger); Assert.That(root.Values, Is.EqualTo(new[] { "a" }));
            Assert.That(a.Content.style.display.value, Is.EqualTo(DisplayStyle.Flex));
            Assert.That(b.Content.style.display.value, Is.EqualTo(DisplayStyle.None));
            Submit(a.Trigger); Assert.That(root.Value, Is.EqualTo("a"));
            Submit(b.Trigger); Assert.That(root.Value, Is.EqualTo("b"));
            root.Collapsible = true; Submit(b.Trigger); Assert.That(root.Values, Is.Empty);
            root.Disabled = true; Submit(a.Trigger); Assert.That(root.Values, Is.Empty);
        }
        [Test] public void AccordionMultipleSelectionTogglesIndependentlyAndCopiesValues()
        {
            var root = Mount(new Accordion { Type = "multiple" }); var a = Section("a"); var b = Section("b");
            root.AddItem(a); root.AddItem(b); Submit(a.Trigger); Submit(b.Trigger);
            Assert.That(root.Values, Is.EqualTo(new[] { "a", "b" }));
            var snapshot = root.Values; snapshot[0] = "corruption";
            Assert.That(root.Values, Is.EqualTo(new[] { "a", "b" }));
            Submit(a.Trigger); Assert.That(root.Values, Is.EqualTo(new[] { "b" }));
            Assert.That(a.Content.style.display.value, Is.EqualTo(DisplayStyle.None));
        }
        [Test] public void ControlledAccordionRequestsWithoutPresentingUncommittedState()
        {
            var root = Mount(new Accordion { Controlled = true }); var a = Section("a"); root.AddItem(a);
            string[] requested = null; root.ValueRequested += v => requested = v;
            Submit(a.Trigger); Assert.That(requested, Is.EqualTo(new[] { "a" })); Assert.That(root.Value, Is.Empty);
            root.Value = "a"; Assert.That(a.Content.style.display.value, Is.EqualTo(DisplayStyle.Flex));
        }
        [Test] public void TabsActivateMatchingPanelAndRejectDuplicateValues()
        {
            var root = Mount(new Tabs()); var a = Tab("a"); var b = Tab("b");
            root.AddItem(a); root.AddItem(b);
            Assert.That(root.Value, Is.EqualTo("a")); Submit(b.Trigger);
            Assert.That(root.Value, Is.EqualTo("b"));
            Assert.That(a.Content.style.display.value, Is.EqualTo(DisplayStyle.None));
            Assert.That(b.Content.style.display.value, Is.EqualTo(DisplayStyle.Flex));
            Assert.Throws<ArgumentException>(() => root.AddItem(Tab("b")));
            Assert.Throws<ArgumentException>(() => root.Values = new[] { "a", "b" });
        }
        [Test] public void TabsArrowNavigationSkipsDisabledAndRespectsManualModeAndLoop()
        {
            var root = Mount(new Tabs()); var a = Tab("a"); var b = Tab("b", true); var c = Tab("c");
            root.AddItem(a); root.AddItem(b); root.AddItem(c);
            Key(a.Trigger, KeyCode.RightArrow); Assert.That(root.Value, Is.EqualTo("c"));
            Key(c.Trigger, KeyCode.RightArrow); Assert.That(root.Value, Is.EqualTo("a"));
            root.ActivationMode = "manual";
            Key(a.Trigger, KeyCode.End); Assert.That(root.Value, Is.EqualTo("a"));
            Assert.That(c.Trigger.tabIndex, Is.Zero); Submit(c.Trigger); Assert.That(root.Value, Is.EqualTo("c"));
            root.ActivationMode = "automatic"; root.Loop = false;
            Key(c.Trigger, KeyCode.RightArrow); Assert.That(root.Value, Is.EqualTo("c"));
            root.Orientation = "vertical";
            Key(c.Trigger, KeyCode.LeftArrow); Assert.That(root.Value, Is.EqualTo("c"));
            Key(c.Trigger, KeyCode.UpArrow); Assert.That(root.Value, Is.EqualTo("a"));
        }
        [Test] public void TabsUnmountAndRemountPreserveContentAndNestedState()
        {
            var root = Mount(new Tabs { UnmountInactive = true }); var a = Tab("a"); var b = Tab("b");
            var nested = new Switch { Checked = true }; a.Add(nested); root.AddItem(a); root.AddItem(b);
            Submit(b.Trigger); Assert.That(a.Content.parent, Is.Null);
            Submit(a.Trigger); Assert.That(a.Content.parent, Is.EqualTo(a)); Assert.That(nested.Checked, Is.True);
        }
        [Test] public void RemovingAnItemRemovesItsPortaledHeaderAndPermitsReparenting()
        {
            var root = Mount(new Tabs()); var a = Tab("a"); root.AddItem(a);
            root.RemoveItem(a); Assert.That(root.Items, Is.Empty); Assert.That(a.Trigger.parent, Is.EqualTo(a));
            var other = Mount(new Tabs()); other.AddItem(a);
            Assert.That(other.Items.Single(), Is.EqualTo(a)); Assert.That(other.Value, Is.EqualTo("a"));
        }
        [Test] public void PopoverActivationEscapeDisabledAndDetachHonorSurfaceBoundary()
        {
            var popover = Mount(new Popover()); Submit(popover.Trigger);
            Assert.That(popover.Open, Is.True); Assert.That(popover.Content.parent, Is.Not.Null);
            popover.CloseOnEscape = false; Key(popover.Trigger, KeyCode.Escape); Assert.That(popover.Open, Is.True);
            popover.CloseOnEscape = true; Key(popover.Trigger, KeyCode.Escape);
            Assert.That(popover.Open, Is.False); Assert.That(popover.Content.parent, Is.Null);
            popover.Disabled = true; Submit(popover.Trigger); Assert.That(popover.Open, Is.False);
            popover.Disabled = false; Submit(popover.Trigger); popover.RemoveFromHierarchy();
            Assert.That(popover.Content.parent, Is.Null);
        }
        [Test] public void PopoverPointerBoundaryExcludesItsOwnContent()
        {
            // Isolate pointer dismissal; pointer focus changes independently exercise blur.
            var popover = Mount(new Popover { CloseOnBlur = false }); var inner = new Button(); popover.Add(inner);
            var outside = Mount(new Button()); popover.Open = true;
            using (var evt = PointerDownEvent.GetPooled()) { evt.target = inner; inner.SendEvent(evt); }
            Assert.That(popover.Open, Is.True);
            popover.CloseOnOutsideClick = false;
            using (var evt = PointerDownEvent.GetPooled()) { evt.target = outside; outside.SendEvent(evt); }
            Assert.That(popover.Open, Is.True);
            popover.CloseOnOutsideClick = true;
            using (var evt = PointerDownEvent.GetPooled()) { evt.target = outside; outside.SendEvent(evt); }
            Assert.That(popover.Open, Is.False);
        }
        [UnityTest] public IEnumerator PopoverBlurTracksAnchorAndContentUnion()
        {
            var popover = Mount(new Popover()); var inner = new Button(); popover.Add(inner); var outside = Mount(new Button());
            popover.Open = true; popover.Trigger.Focus(); yield return null;
            inner.Focus(); yield return null; Assert.That(popover.Open, Is.True);
            outside.Focus(); yield return null; Assert.That(popover.Open, Is.False);
        }
        [Test] public void AnchoredGeometryFlipsAndShiftsAtViewportEdges()
        {
            var anchor = new Rect(90, 90, 10, 10);
            Assert.That(AnchoredSurface.CalculatePosition(anchor, new Vector2(30, 20), new Vector2(100, 100), "bottom"), Is.EqualTo(new Vector2(70, 66)));
            Assert.That(AnchoredSurface.CalculatePosition(anchor, new Vector2(30, 20), new Vector2(100, 100), "right"), Is.EqualTo(new Vector2(56, 80)));
            Assert.That(AnchoredSurface.CalculatePosition(anchor, new Vector2(130, 120), new Vector2(100, 100), "auto"), Is.EqualTo(Vector2.zero));
        }
        [UnityTest] public IEnumerator UxmlImportsRealGeneratedControlsAndCompoundItems()
        {
            var asset = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>("Assets/InteractiveControls/Controls.uxml");
            Assert.That(asset, Is.Not.Null);
            asset.CloneTree(window.rootVisualElement);
            yield return null; yield return null;
            var sound = window.rootVisualElement.Q<Switch>("sound");
            Assert.That(sound.Checked, Is.True); Assert.That(sound.Label, Is.EqualTo("Enable sound"));
            var accordion = window.rootVisualElement.Q<Accordion>("settings");
            Assert.That(accordion.Items.Count, Is.EqualTo(2)); Assert.That(accordion.Value, Is.EqualTo("graphics"));
            var tabs = window.rootVisualElement.Q<Tabs>("pages");
            Assert.That(tabs.Items.Count, Is.EqualTo(3)); Submit(tabs.Items[1].Trigger);
            Assert.That(tabs.Value, Is.EqualTo("inventory"));
            var popover = window.rootVisualElement.Q<Popover>("help"); Submit(popover.Trigger);
            Assert.That(popover.Open, Is.True); Assert.That(popover.Content.Q<Button>(), Is.Not.Null);
        }
    }
}
