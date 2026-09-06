using System;
using UnityEngine;
using UnityEngine.UIElements;

namespace FullStackDS
{
    // Framework substrate: boolean channel + native UI Toolkit activation.
    [UxmlElement, HideInInspector]
    public partial class BooleanControl : VisualElement, INotifyValueChanged<bool>
    {
        private bool current;
        public Button Trigger { get; } = new Button();
        private readonly VisualElement track = new VisualElement();
        private readonly VisualElement thumb = new VisualElement();
        private readonly Label caption = new Label();
        public bool Controlled { get; set; }
        public event Action<bool> ValueRequested;
        [UxmlAttribute] public string Label { get => caption.text; set => caption.text = value; }
        public bool Disabled { get => !enabledSelf; set => SetEnabled(!value); }
        public float TrackWidth { get => track.style.width.value.value; set => track.style.width = value; }
        public float TrackHeight { get => track.style.height.value.value; set => track.style.height = value; }
        public float ThumbSize { get => thumb.style.width.value.value; set { thumb.style.width = value; thumb.style.height = value; } }
        public bool value
        {
            get => current;
            set
            {
                if (current == value) return;
                using (var evt = ChangeEvent<bool>.GetPooled(current, value))
                {
                    SetValueWithoutNotify(value);
                    evt.target = this;
                    SendEvent(evt);
                }
            }
        }
        public BooleanControl()
        {
            Trigger.clicked += () => RequestValue(!current);
            Trigger.style.flexDirection = FlexDirection.Row;
            Trigger.style.alignItems = Align.Center;
            track.style.flexDirection = FlexDirection.Row;
            track.style.alignItems = Align.Center;
            TrackWidth = 36; TrackHeight = 20; ThumbSize = 16;
            Skin.Round(track, 12); Skin.Round(thumb, 10);
            thumb.style.backgroundColor = Color.white;
            track.Add(thumb); Trigger.Add(track); Trigger.Add(caption); hierarchy.Add(Trigger);
            SetValueWithoutNotify(false);
        }
        protected void Configure(string controlPart, string prefix)
        {
            Trigger.name = controlPart;
            Trigger.AddToClassList(prefix + "__" + controlPart);
            track.name = "track"; thumb.name = "thumb";
        }
        public void RequestValue(bool next)
        {
            if (!enabledInHierarchy || next == current) return;
            if (!Controlled) value = next;
            ValueRequested?.Invoke(next);
        }
        public void SetValueWithoutNotify(bool next)
        {
            current = next;
            EnableInClassList("is-checked", next);
            track.style.backgroundColor = next ? Skin.Accent : Skin.Muted;
            track.style.justifyContent = next ? Justify.FlexEnd : Justify.FlexStart;
        }
    }
    internal static class Skin
    {
        internal static readonly Color Accent = new Color(.20f, .43f, .83f);
        internal static readonly Color Muted = new Color(.30f, .32f, .36f);
        internal static readonly Color Panel = new Color(.15f, .16f, .19f);
        internal static void Round(VisualElement node, float radius)
        {
            node.style.borderTopLeftRadius = radius; node.style.borderTopRightRadius = radius;
            node.style.borderBottomLeftRadius = radius; node.style.borderBottomRightRadius = radius;
        }
        internal static void Padding(VisualElement node, float amount)
        {
            node.style.paddingLeft = amount; node.style.paddingRight = amount;
            node.style.paddingTop = amount; node.style.paddingBottom = amount;
        }
    }
}
