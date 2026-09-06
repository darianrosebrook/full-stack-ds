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
            Theme.Attach(this);
            Trigger.AddToClassList("fsds-toggle-trigger");
            track.AddToClassList("fsds-toggle-track");
            thumb.AddToClassList("fsds-toggle-thumb");
            caption.AddToClassList("fsds-toggle-caption");
            Trigger.clicked += () => RequestValue(!current);
            Trigger.style.flexDirection = FlexDirection.Row;
            Trigger.style.alignItems = Align.Center;
            track.style.flexDirection = FlexDirection.Row;
            track.style.alignItems = Align.Center;
            TrackWidth = 36; TrackHeight = 20; ThumbSize = 16;
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
        }
    }
}
