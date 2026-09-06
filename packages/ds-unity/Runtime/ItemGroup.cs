using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UIElements;

namespace FullStackDS
{
    [UxmlElement, HideInInspector]
    public partial class SelectionItem : VisualElement
    {
        public Button Trigger { get; } = new Button();
        public VisualElement Content { get; } = new VisualElement();
        private readonly Label marker = new Label();
        private readonly Label caption = new Label();
        private string key = "";
        internal ItemGroup Owner;
        [UxmlAttribute] public string Value
        {
            get => key;
            set
            {
                if (Owner != null && key != value) throw new InvalidOperationException("Remove the item before changing its value.");
                key = value;
            }
        }
        [UxmlAttribute] public string Label { get => caption.text; set => caption.text = value; }
        [UxmlAttribute] public bool Disabled
        {
            get => !enabledSelf;
            set { SetEnabled(!value); Trigger.SetEnabled(!value); Owner?.Refresh(); }
        }
        public override VisualElement contentContainer => Content;
        public SelectionItem()
        {
            Theme.Attach(this);
            AddToClassList("fsds-item");
            Content.AddToClassList("fsds-item-content");
            marker.AddToClassList("fsds-disclosure-marker");
            caption.AddToClassList("fsds-item-caption");
            Trigger.Add(caption);
            hierarchy.Add(Trigger); hierarchy.Add(Content);
            Trigger.clicked += () => Owner?.Activate(this);
            Trigger.RegisterCallback<KeyDownEvent>(e => Owner?.Navigate(this, e));
            Content.focusable = true; Content.tabIndex = 0;
            RegisterCallback<AttachToPanelEvent>(_ => schedule.Execute(() => {
                var group = GetFirstAncestorOfType<ItemGroup>();
                group?.SynchronizeChildren();
            }));
            RegisterCallback<DetachFromPanelEvent>(_ => {
                var owner = Owner;
                owner?.schedule.Execute(owner.SynchronizeChildren);
            });
        }
        internal void Present(bool selected, bool tabs, bool unmount)
        {
            EnableInClassList("is-selected", selected);
            Trigger.EnableInClassList("is-selected", selected);
            Trigger.EnableInClassList("fsds-tab-trigger", tabs);
            Trigger.EnableInClassList("fsds-disclosure-trigger", !tabs);
            if (!tabs) {
                marker.text = selected ? "−" : "+";
                if (marker.parent != Trigger) Trigger.Add(marker);
            } else marker.RemoveFromHierarchy();
            if (unmount && !selected) Content.RemoveFromHierarchy();
            else {
                if (Content.parent != this) hierarchy.Add(Content);
                Content.style.display = selected ? DisplayStyle.Flex : DisplayStyle.None;
            }
        }
    }

    [UxmlElement, HideInInspector]
    public partial class ItemGroup : VisualElement
    {
        private readonly VisualElement itemsHost = new VisualElement();
        private readonly VisualElement strip = new VisualElement();
        private readonly List<SelectionItem> items = new List<SelectionItem>();
        private string[] selected = Array.Empty<string>();
        private bool explicitValue;
        private bool tabs;
        private bool multiple;
        private bool collapsible;
        private bool unmount;
        private string orientation = "horizontal";
        private string appearance = "underline";
        private string activation = "automatic";
        private string triggerPart = "trigger", contentPart = "content", prefix = "fsds";
        public override VisualElement contentContainer => itemsHost;
        public IReadOnlyList<SelectionItem> Items => items.AsReadOnly();
        public bool Controlled { get; set; }
        public event Action<string[]> ValueRequested;
        public event Action<string[]> ValueChanged;
        public bool Disabled { get => !enabledSelf; set => SetEnabled(!value); }
        public bool Loop { get; set; } = true;
        public bool Collapsible { get => collapsible; set => collapsible = value; }
        public bool UnmountInactive { get => unmount; set { unmount = value; Refresh(); } }
        public string SelectionType
        {
            get => multiple ? "multiple" : "single";
            set
            {
                if (value != "multiple" && value != "single") throw new ArgumentException("Expected single or multiple.");
                if (tabs && value == "multiple") throw new ArgumentException("Select operations are single-valued.");
                multiple = value == "multiple";
                if (!multiple && selected.Length > 1) SetValuesWithoutNotify(selected.Take(1).ToArray());
            }
        }
        public string Orientation
        {
            get => orientation;
            set
            {
                if (value != "horizontal" && value != "vertical") throw new ArgumentException("Expected horizontal or vertical.");
                orientation = value;
                strip.style.flexDirection = value == "vertical" ? FlexDirection.Column : FlexDirection.Row;
                style.flexDirection = tabs && value == "vertical" ? FlexDirection.Row : FlexDirection.Column;
            }
        }
        public string ActivationMode
        {
            get => activation;
            set
            {
                if (value != "manual" && value != "automatic") throw new ArgumentException("Expected automatic or manual.");
                activation = value;
            }
        }
        public string Appearance
        {
            get => appearance;
            set
            {
                if (value != "underline" && value != "pills") throw new ArgumentException("Expected underline or pills.");
                appearance = value; Refresh();
            }
        }
        public string Value { get => selected.FirstOrDefault() ?? ""; set => Values = string.IsNullOrEmpty(value) ? Array.Empty<string>() : new[] { value }; }
        public string[] Values
        {
            get => (string[])selected.Clone();
            set
            {
                var old = Values;
                SetValuesWithoutNotify(value);
                if (!old.SequenceEqual(selected)) ValueChanged?.Invoke(Values);
            }
        }
        public ItemGroup()
        {
            Theme.Attach(this);
            strip.AddToClassList("fsds-tab-list");
            hierarchy.Add(strip); hierarchy.Add(itemsHost);
            itemsHost.style.flexGrow = 1;
            RegisterCallback<AttachToPanelEvent>(_ => schedule.Execute(SynchronizeChildren));
        }
        protected void Configure(string operation, string trigger, string content, string cssPrefix)
        {
            tabs = operation == "select";
            triggerPart = trigger; contentPart = content; prefix = cssPrefix;
            strip.name = "list"; strip.style.display = tabs ? DisplayStyle.Flex : DisplayStyle.None;
            Orientation = orientation;
        }
        public void AddItem(SelectionItem item)
        {
            if (item == null) throw new ArgumentNullException(nameof(item));
            if (string.IsNullOrEmpty(item.Value) || items.Any(i => i.Value == item.Value)) throw new ArgumentException("Item values must be non-empty and unique.");
            if (item.Owner != null) throw new InvalidOperationException("Remove the item from its previous group first.");
            itemsHost.Add(item); SynchronizeChildren();
        }
        public void RemoveItem(SelectionItem item)
        {
            if (item.Owner != this) return;
            item.Trigger.RemoveFromHierarchy();
            item.hierarchy.Insert(0, item.Trigger);
            item.RemoveFromHierarchy(); item.Owner = null;
            SynchronizeChildren();
        }
        public void SynchronizeChildren()
        {
            var next = itemsHost.Children().OfType<SelectionItem>().ToList();
            if (next.Any(i => string.IsNullOrEmpty(i.Value)) || next.Select(i => i.Value).Distinct().Count() != next.Count)
                throw new ArgumentException("Item values must be non-empty and unique.");
            foreach (var old in items.Where(i => !next.Contains(i)).ToArray()) {
                old.Trigger.RemoveFromHierarchy(); old.hierarchy.Insert(0, old.Trigger); old.Owner = null;
            }
            items.Clear(); items.AddRange(next);
            foreach (var item in items) {
                item.Owner = this; item.Trigger.name = triggerPart; item.Content.name = contentPart;
                item.Trigger.AddToClassList(prefix + "__" + triggerPart);
                item.Content.AddToClassList(prefix + "__" + contentPart);
                item.Trigger.SetEnabled(item.enabledSelf);
                if (tabs) strip.Add(item.Trigger);
            }
            if (tabs && !explicitValue) selected = items.Where(i => i.enabledSelf).Take(1).Select(i => i.Value).ToArray();
            Refresh();
        }
        public void SetValuesWithoutNotify(string[] next)
        {
            if (next == null || next.Any(string.IsNullOrEmpty) || next.Distinct().Count() != next.Length)
                throw new ArgumentException("Selected values must be non-null, non-empty and unique.");
            if ((!multiple || tabs) && next.Length > 1) throw new ArgumentException("Single selection accepts at most one value.");
            explicitValue = true; selected = (string[])next.Clone(); Refresh();
        }
        public void Activate(SelectionItem item)
        {
            if (!enabledInHierarchy || !items.Contains(item) || !item.enabledSelf) return;
            var next = Values;
            if (tabs) next = new[] { item.Value };
            else if (multiple) next = next.Contains(item.Value) ? next.Where(v => v != item.Value).ToArray() : next.Concat(new[] { item.Value }).ToArray();
            else if (next.Contains(item.Value)) { if (!collapsible) return; next = Array.Empty<string>(); }
            else next = new[] { item.Value };
            if (next.SequenceEqual(selected)) return;
            if (!Controlled) Values = next;
            ValueRequested?.Invoke((string[])next.Clone());
        }
        internal void Navigate(SelectionItem item, KeyDownEvent evt)
        {
            if (!enabledInHierarchy || !item.enabledSelf) return;
            var candidates = items.Where(i => i.enabledSelf).ToList();
            var index = candidates.IndexOf(item);
            if (index < 0) return;
            int next;
            if (evt.keyCode == KeyCode.Home) next = 0;
            else if (evt.keyCode == KeyCode.End) next = candidates.Count - 1;
            else {
                int delta = 0;
                if (orientation == "horizontal") { if (evt.keyCode == KeyCode.LeftArrow) delta = -1; if (evt.keyCode == KeyCode.RightArrow) delta = 1; }
                else { if (evt.keyCode == KeyCode.UpArrow) delta = -1; if (evt.keyCode == KeyCode.DownArrow) delta = 1; }
                if (delta == 0) return; // Native Button owns Enter/Space activation.
                next = Loop ? (index + delta + candidates.Count) % candidates.Count : Math.Max(0, Math.Min(candidates.Count - 1, index + delta));
            }
            evt.StopPropagation();
            candidates[next].Trigger.Focus();
            if (tabs && activation == "automatic") Activate(candidates[next]);
            if (tabs) foreach (var candidate in candidates) candidate.Trigger.tabIndex = candidate == candidates[next] ? 0 : -1;
        }
        internal void Refresh()
        {
            var active = items.FirstOrDefault(i => selected.Contains(i.Value) && i.enabledSelf) ?? items.FirstOrDefault(i => i.enabledSelf);
            foreach (var item in items) {
                bool isSelected = selected.Contains(item.Value);
                item.Present(isSelected, tabs, unmount);
                item.Trigger.tabIndex = tabs ? (item == active ? 0 : -1) : 0;
                if (tabs) {
                    float radius = appearance == "pills" ? 20 : 6;
                    item.Trigger.style.borderTopLeftRadius = radius; item.Trigger.style.borderTopRightRadius = radius;
                    item.Trigger.style.borderBottomLeftRadius = radius; item.Trigger.style.borderBottomRightRadius = radius;
                    item.Trigger.style.borderBottomWidth = isSelected && appearance == "underline" ? 3 : 0;

                }
            }
        }
    }
}
