# Theming System Guide

This guide explains how to use the comprehensive theming system to replace hardcoded colors with semantic, themeable alternatives.

## 🎨 **Semantic Color System**

### **Base Colors**
- `bg-background` - Main background color
- `bg-card` - Card/surface background
- `bg-muted` - Muted background for subtle elements
- `text-foreground` - Primary text color
- `text-muted-foreground` - Secondary/muted text color

### **Interactive Colors**
- `bg-primary` / `text-primary-foreground` - Primary actions
- `bg-secondary` / `text-secondary-foreground` - Secondary actions
- `bg-accent` / `text-accent-foreground` - Accent elements
- `border-border` - Standard borders
- `ring-ring` - Focus rings

### **Status Colors**
- `bg-destructive` / `text-destructive-foreground` - Errors, delete actions
- `bg-success` / `text-success-foreground` - Success states
- `bg-warning` / `text-warning-foreground` - Warnings

## 🔄 **Replacing Hardcoded Colors**

### **Before (Hardcoded)**
```tsx
// ❌ Hardcoded colors - not themeable
<div className="bg-blue-500 text-white border-gray-200">
  <button className="bg-red-500 hover:bg-red-600 text-white">
    Delete
  </button>
</div>
```

### **After (Semantic)**
```tsx
// ✅ Semantic colors - fully themeable
<div className="bg-primary text-primary-foreground border-border">
  <button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
    Delete
  </button>
</div>
```

## 🛠️ **Common Replacements**

### **Background Colors**
```tsx
// Replace these hardcoded colors:
bg-white → bg-background
bg-gray-100 → bg-muted
bg-blue-500 → bg-primary
bg-red-500 → bg-destructive
bg-green-500 → bg-success
bg-yellow-500 → bg-warning
```

### **Text Colors**
```tsx
// Replace these hardcoded colors:
text-gray-900 → text-foreground
text-gray-600 → text-muted-foreground
text-blue-600 → text-primary
text-red-600 → text-destructive
text-green-600 → text-success
text-yellow-600 → text-warning
```

### **Border Colors**
```tsx
// Replace these hardcoded colors:
border-gray-200 → border-border
border-blue-500 → border-primary
border-red-500 → border-destructive
border-green-500 → border-success
border-yellow-500 → border-warning
```

### **Shadow Colors**
```tsx
// Replace these hardcoded colors:
shadow-lg → shadow (semantic shadow)
shadow-blue-500/20 → shadowColored (primary colored shadow)
```

## 🎯 **Semantic Class Combinations**

### **Cards**
```tsx
// Use semantic card classes
<div className="bg-card text-card-foreground border border-border rounded-lg shadow">
  Card content
</div>
```

### **Buttons**
```tsx
// Use semantic button variants
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
  Primary Button
</button>

<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md">
  Destructive Button
</button>
```

### **Status Indicators**
```tsx
// Use semantic status colors
<div className="bg-success/10 text-success border border-success/20 px-3 py-2 rounded-md">
  Success message
</div>

<div className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-2 rounded-md">
  Error message
</div>
```

## 🎨 **Gradients**

### **Semantic Gradients**
```tsx
// Use semantic gradient classes
<div className="bg-gradient-to-br from-primary to-primary/80">
  Primary gradient
</div>

<div className="bg-gradient-to-br from-secondary to-secondary/80">
  Secondary gradient
</div>
```

## 🔧 **Using Theme Utilities**

### **Import Theme Utilities**
```tsx
import { themeColors, buttonVariants, semanticClasses } from '@/lib/theme-utils';
import { cn } from '@/lib/cn';

// Use semantic classes
<div className={cn(themeColors.bgCard, 'p-4')}>
  <button className={cn(buttonVariants.default, 'px-4 py-2')}>
    Click me
  </button>
</div>
```

### **Pre-built Semantic Combinations**
```tsx
import { semanticClasses } from '@/lib/theme-utils';

// Use pre-built semantic combinations
<div className={semanticClasses.card}>
  <button className={semanticClasses.buttonPrimary}>
    Primary Action
  </button>
</div>
```

## 🎨 **Creating New Themes**

### **Add New Theme Colors**
1. Update `src/lib/theme-config.ts`
2. Add new theme colors to the `ThemeColors` interface
3. Define colors for both light and dark themes
4. Update CSS custom properties in `globals.css`

### **Example: Adding a New Brand Color**
```typescript
// In theme-config.ts
export interface ThemeColors {
  // ... existing colors
  brand: string;
  brandForeground: string;
}

export const lightTheme: ThemeColors = {
  // ... existing colors
  brand: '#8b5cf6',
  brandForeground: '#ffffff',
};

export const darkTheme: ThemeColors = {
  // ... existing colors
  brand: '#a855f7',
  brandForeground: '#ffffff',
};
```

## 🚀 **Best Practices**

### **Do's**
- ✅ Use semantic color names (`bg-primary`, `text-foreground`)
- ✅ Use theme utilities for common patterns
- ✅ Test both light and dark themes
- ✅ Use consistent color meanings across the app

### **Don'ts**
- ❌ Use hardcoded Tailwind colors (`bg-blue-500`, `text-red-600`)
- ❌ Mix semantic and hardcoded colors
- ❌ Use colors that don't have semantic meaning
- ❌ Forget to test theme switching

## 🧪 **Testing Themes**

### **Manual Testing**
1. Switch between light/dark themes
2. Verify all components adapt correctly
3. Check contrast ratios for accessibility
4. Test with different content lengths

### **Automated Testing**
```tsx
// Test theme switching in components
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers/theme-provider';

test('component adapts to dark theme', () => {
  render(
    <ThemeProvider defaultTheme="dark">
      <MyComponent />
    </ThemeProvider>
  );
  // Assert dark theme styles are applied
});
```

## 📝 **Migration Checklist**

When updating components to use the theming system:

- [ ] Replace hardcoded background colors with semantic ones
- [ ] Replace hardcoded text colors with semantic ones
- [ ] Replace hardcoded border colors with semantic ones
- [ ] Replace hardcoded shadow colors with semantic ones
- [ ] Test in both light and dark themes
- [ ] Verify accessibility and contrast
- [ ] Update any custom CSS to use CSS custom properties
- [ ] Document any new semantic colors added

This theming system ensures that all colors are semantic, themeable, and maintainable. By following these patterns, you can easily create new themes or modify existing ones without touching component code.

