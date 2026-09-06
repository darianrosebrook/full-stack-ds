using System;
using UnityEngine;
using UnityEngine.UIElements;

namespace FullStackDS
{
    /// <summary>Package-owned styling, independent of Editor theme inheritance.
    /// Call Attach on a consumer container to style ordinary labels/buttons too.
    /// Floating surfaces attach separately because they leave their document tree.</summary>
    public static class Theme
    {
        private static StyleSheet controls;
        public static void Attach(VisualElement root)
        {
            if (controls == null) controls = Resources.Load<StyleSheet>("FullStackDS/Controls");
            if (controls == null) throw new InvalidOperationException("Full Stack DS stylesheet is missing from the imported package.");
            if (!root.styleSheets.Contains(controls)) root.styleSheets.Add(controls);
            root.AddToClassList("fsds-theme");
        }
    }
}
