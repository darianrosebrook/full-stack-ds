using System;
using UnityEngine;
using UnityEngine.UIElements;

namespace FullStackDS
{
    [UxmlElement, HideInInspector]
    public partial class AnchoredSurface : VisualElement, INotifyValueChanged<bool>
    {
        public Button Trigger { get; } = new Button();
        public VisualElement Content { get; } = new ScrollView(ScrollViewMode.Vertical);
        private bool current;
        private VisualElement panelRoot;
        private string placement = "bottom";
        private IVisualElementScheduledItem tracking;
        public override VisualElement contentContainer => Content;
        public bool Controlled { get; set; }
        public event Action<bool> ValueRequested;
        [UxmlAttribute] public string Label { get => Trigger.text; set => Trigger.text = value; }
        public bool CloseOnEscape { get; set; }
        public bool CloseOnOutsideClick { get; set; }
        public bool CloseOnBlur { get; set; }
        public bool Disabled { get => !enabledSelf; set { SetEnabled(!value); Refresh(); } }
        public string Placement
        {
            get => placement;
            set {
                if (value != "top" && value != "bottom" && value != "left" && value != "right" && value != "auto")
                    throw new ArgumentException("Unsupported anchored placement.");
                placement = value; Reposition();
            }
        }
        public bool value
        {
            get => current;
            set {
                if (current == value) return;
                using (var evt = ChangeEvent<bool>.GetPooled(current, value)) {
                    SetValueWithoutNotify(value); evt.target = this; SendEvent(evt);
                }
            }
        }
        public AnchoredSurface()
        {
            Theme.Attach(this); Theme.Attach(Content);
            Content.AddToClassList("fsds-surface");
            hierarchy.Add(Trigger);
            Trigger.clicked += () => RequestValue(!current);
            Content.style.position = Position.Absolute;
            Content.focusable = true;
            Content.RegisterCallback<GeometryChangedEvent>(_ => Reposition());
            Trigger.RegisterCallback<GeometryChangedEvent>(_ => Reposition());
            RegisterCallback<AttachToPanelEvent>(OnAttach);
            RegisterCallback<DetachFromPanelEvent>(OnDetach);
        }
        protected void Configure(string trigger, string content, string prefix)
        {
            Trigger.name = trigger; Content.name = content;
            Trigger.AddToClassList(prefix + "__" + trigger);
            Content.AddToClassList(prefix + "__" + content);
        }
        private void OnAttach(AttachToPanelEvent evt)
        {
            if (evt.target != this) return;
            panelRoot = panel.visualTree;
            panelRoot.RegisterCallback<PointerDownEvent>(Outside, TrickleDown.TrickleDown);
            panelRoot.RegisterCallback<KeyDownEvent>(Escape, TrickleDown.TrickleDown);
            panelRoot.RegisterCallback<FocusOutEvent>(Blur, TrickleDown.TrickleDown);
            panelRoot.RegisterCallback<GeometryChangedEvent>(PanelGeometry);
            tracking = schedule.Execute(() => { Refresh(); Reposition(); }).Every(16);
            Refresh();
        }
        private void OnDetach(DetachFromPanelEvent evt)
        {
            if (evt.target != this || panelRoot == null) return;
            panelRoot.UnregisterCallback<PointerDownEvent>(Outside, TrickleDown.TrickleDown);
            panelRoot.UnregisterCallback<KeyDownEvent>(Escape, TrickleDown.TrickleDown);
            panelRoot.UnregisterCallback<FocusOutEvent>(Blur, TrickleDown.TrickleDown);
            panelRoot.UnregisterCallback<GeometryChangedEvent>(PanelGeometry);
            tracking?.Pause(); tracking = null;
            Content.RemoveFromHierarchy(); panelRoot = null;
        }
        private void PanelGeometry(GeometryChangedEvent _) => Reposition();
        private bool Inside(VisualElement node) => node != null && (node == Trigger || Trigger.Contains(node) || node == Content || Content.Contains(node));
        private void Outside(PointerDownEvent evt)
        {
            if (current && CloseOnOutsideClick && !Inside(evt.target as VisualElement)) RequestValue(false);
        }
        private void Escape(KeyDownEvent evt)
        {
            if (current && enabledInHierarchy && CloseOnEscape && evt.keyCode == KeyCode.Escape && Inside(evt.target as VisualElement)) {
                evt.StopPropagation(); RequestValue(false); Trigger.Focus();
            }
        }
        private void Blur(FocusOutEvent evt)
        {
            if (!current || !CloseOnBlur || !Inside(evt.target as VisualElement)) return;
            if (evt.relatedTarget is VisualElement next) {
                if (!Inside(next)) RequestValue(false);
            } else {
                schedule.Execute(() => {
                    if (panel != null && current && CloseOnBlur && !Inside(panel.focusController.focusedElement as VisualElement)) RequestValue(false);
                });
            }
        }
        public void RequestValue(bool next)
        {
            if (!enabledInHierarchy || next == current) return;
            if (!Controlled) value = next;
            ValueRequested?.Invoke(next);
        }
        public void SetValueWithoutNotify(bool next) { current = next; Refresh(); }
        private void Refresh()
        {
            EnableInClassList("is-open", current && enabledInHierarchy);
            if (panelRoot == null) return;
            if (current) tracking?.Resume(); else tracking?.Pause();
            if (current && enabledInHierarchy) {
                if (Content.parent != panelRoot) {
                    panelRoot.Add(Content); Content.BringToFront();
                    Content.schedule.Execute(Reposition);
                }
            } else Content.RemoveFromHierarchy();
        }
        public void Reposition()
        {
            if (!current || Content.parent == null || panelRoot == null) return;
            Rect anchor = Trigger.worldBound;
            Vector2 start = panelRoot.WorldToLocal(anchor.position);
            Rect localAnchor = new Rect(start, anchor.size);
            Rect bounds = panelRoot.contentRect;
            // The floating node is outside UIDocument; carry its styles locally
            // and constrain its scroll viewport before measuring placement.
            float maxWidth = Mathf.Max(0, bounds.width - 16);
            float maxHeight = Mathf.Max(0, bounds.height - 16);
            Content.style.maxWidth = maxWidth;
            Content.style.maxHeight = maxHeight;
            Vector2 size = Content.layout.size;
            if (float.IsNaN(size.x) || float.IsNaN(size.y)) return;
            Vector2 point = CalculatePosition(localAnchor, size, bounds.size, placement);
            Content.style.left = point.x; Content.style.top = point.y;
        }
        // Framework geometry law: preferred side, opposite-side flip, viewport shift.
        public static Vector2 CalculatePosition(Rect anchor, Vector2 content, Vector2 viewport, string placement)
        {
            const float gap = 4;
            bool horizontal = placement == "left" || placement == "right";
            float x = anchor.xMin, y = anchor.yMax + gap;
            if (horizontal) {
                x = placement == "left" ? anchor.xMin - content.x - gap : anchor.xMax + gap;
                y = anchor.yMin;
                float opposite = placement == "left" ? anchor.xMax + gap : anchor.xMin - content.x - gap;
                if ((x < 0 || x + content.x > viewport.x) && opposite >= 0 && opposite + content.x <= viewport.x) x = opposite;
            } else {
                y = placement == "top" ? anchor.yMin - content.y - gap : anchor.yMax + gap;
                float opposite = placement == "top" ? anchor.yMax + gap : anchor.yMin - content.y - gap;
                if ((y < 0 || y + content.y > viewport.y) && opposite >= 0 && opposite + content.y <= viewport.y) y = opposite;
            }
            return new Vector2(Mathf.Clamp(x, 0, Mathf.Max(0, viewport.x - content.x)), Mathf.Clamp(y, 0, Mathf.Max(0, viewport.y - content.y)));
        }
    }
}
