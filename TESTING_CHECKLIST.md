# Testing & QA Checklist

**Status:** In Progress  
**Date:** 2026-08-27  
**Focus:** Comprehensive testing before deployment

---

## 1. Visual Design Verification

### Color Palette
- [x] Landing page: Orange hero (#F46B1F), beige background (#FBF3E7)
- [x] Chat page: Orange message bubbles, beige sidebar
- [x] Safety plan: Notebook metaphor with left orange border
- [x] Resources: Cards with left orange borders
- [x] Crisis mode: Full-screen red (#C0392B)
- [x] No cool grays used anywhere
- [x] Dark mode colors properly inverted

### Typography
- [x] Fraunces font loaded for headings (44px, 28px, etc.)
- [x] Inter font for body text (16px)
- [x] Noto Nastaliq Urdu for Urdu text
- [x] Proper line-height ratios (1.2 for headers, 1.5 for body)
- [x] Bilingual content (Urdu + English translations)

### Components
- [x] Sidebar navigation: 80px fixed width, proper spacing
- [x] Message bubbles: Proper colors and padding
- [x] Buttons: Orange primary, white secondary, outline border
- [x] Input fields: Dashed borders on safety plan, normal on chat
- [x] Cards: Left border accent, hover lift effect
- [x] Progress bar: Smooth transitions

---

## 2. Functionality Testing

### Landing Page
- [ ] Hero section renders correctly
- [ ] Feature cards are clickable and navigate correctly
- [ ] Orange CTA button redirects to onboarding
- [ ] Safety notice displays properly
- [ ] No console errors

### Onboarding Flow
- [ ] Step 1: Name input accepts text
- [ ] Step 2: Topic selection toggles work
- [ ] Step 3: Support style radio buttons work
- [ ] Step 4: Language dropdown works
- [ ] Progress bar updates on each step
- [ ] "Complete" button saves preferences
- [ ] Redirects to chat after completion

### Chat Page
- [ ] Initial greeting message displays
- [ ] Message input accepts text
- [ ] Send button submits messages
- [ ] Assistant responses appear
- [ ] Mood tracker 1-5 scale works
- [ ] Support style selector changes modes
- [ ] "Start Over" button clears chat
- [ ] Messages scroll to bottom automatically
- [ ] Crisis detection triggers alert properly

### Safety Plan Builder
- [ ] All four steps are accessible
- [ ] Text inputs accept multi-line content
- [ ] Contact form adds/removes contacts properly
- [ ] "Suggest from chats" button works
- [ ] Progress bar shows correct step
- [ ] Back/Next navigation works
- [ ] "See my plan" button completes flow

### Resources Page
- [ ] Search input filters resources
- [ ] City filters work
- [ ] Resource cards display with proper styling
- [ ] Phone numbers are clickable (tel: links)
- [ ] Website links open in new tab
- [ ] Type badges show correctly

### Crisis Mode
- [ ] Full-screen red background displays
- [ ] Emergency numbers are oversized
- [ ] Phone buttons are large (48px+)
- [ ] Resources list shows secondary options
- [ ] Back button returns to chat
- [ ] No way to get "trapped"

---

## 3. Responsive Design

### Mobile (375px)
- [ ] Sidebar is hidden or minimal
- [ ] Text is readable at default zoom
- [ ] Buttons are 48px+ tall
- [ ] Inputs are touch-friendly
- [ ] No horizontal scroll
- [ ] Forms stack vertically

### Tablet (768px)
- [ ] Layout adapts properly
- [ ] Sidebar visible on left
- [ ] Two-column chat layout works
- [ ] Content center-aligned

### Desktop (1024px+)
- [ ] 80px sidebar on all pages
- [ ] Proper max-widths on content
- [ ] Two-column layouts render side-by-side
- [ ] No content runs off screen

---

## 4. Dark Mode Testing

### System Preference
- [ ] Light mode: Beige background, warm text
- [ ] Dark mode: Dark background, light text
- [ ] Colors are readable in both modes
- [ ] No color contrast issues

### Manual Toggle
- [ ] MoonToggle component works
- [ ] Theme persists on page reload
- [ ] All pages respect dark mode preference

---

## 5. Accessibility

### Keyboard Navigation
- [ ] Tab key navigates through all interactive elements
- [ ] Focus states are visible (orange outline)
- [ ] Tab order is logical
- [ ] No keyboard traps

### Color Contrast
- [ ] Orange text on white: Meets WCAG AA (4.5:1)
- [ ] Beige on white: Meets WCAG AA
- [ ] Text on colored backgrounds: All 4.5:1+

### Screen Reader
- [ ] Page structure makes sense when read
- [ ] Form labels are associated with inputs
- [ ] Button purposes are clear
- [ ] No unlabeled images or icons

### Motion
- [ ] Reduced motion preference is respected
- [ ] Animations disable when `prefers-reduced-motion: reduce`
- [ ] Page is fully functional without animations

---

## 6. Crisis Detection Flow

### Manual Testing
- [ ] Type "I want to die" → Crisis alert appears
- [ ] Type "no reason to continue" → Crisis alert
- [ ] Type "going to hurt myself" → Crisis alert
- [ ] Type "my family would be better off" → Crisis alert
- [ ] Crisis page displays immediately
- [ ] Red screen with phone numbers visible
- [ ] Can click phone numbers
- [ ] Can return to chat safely

---

## 7. Bilingual Support

### Urdu Content
- [ ] Urdu headings display in Nastaliq
- [ ] Roman Urdu italics show correctly
- [ ] English translations display below Urdu
- [ ] No text overflow issues with long text

### Language Selection
- [ ] Onboarding allows language choice
- [ ] Selection persists in preferences
- [ ] Chat adapts based on preference

---

## 8. Performance

### Page Load
- [ ] Landing page loads < 3s
- [ ] Chat page loads < 2s
- [ ] No jank or stuttering
- [ ] Fonts load without flash

### API Calls
- [ ] Message sends and receives properly
- [ ] Crisis detection runs without blocking UI
- [ ] Preferences save successfully
- [ ] Resources load on demand

---

## 9. Cross-Browser Testing

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Fonts render correctly

### Firefox
- [ ] All features work
- [ ] Form inputs behave correctly

### Safari
- [ ] All features work
- [ ] CSS works as expected

### Mobile Safari (iOS)
- [ ] Tap targets are large enough
- [ ] Keyboard doesn't hide inputs
- [ ] Tel: links work

---

## 10. Error Handling

### Network Errors
- [ ] Show friendly error message
- [ ] Allow retry
- [ ] Don't crash app

### Invalid Input
- [ ] Empty name on onboarding: Block continue
- [ ] Empty message: Block send
- [ ] Show validation feedback

### Edge Cases
- [ ] Very long messages: Handle word wrap
- [ ] Many contacts: Scroll properly
- [ ] No resources found: Show empty state

---

## Final Sign-Off

- [ ] All critical features working
- [ ] Design consistent across app
- [ ] No major accessibility issues
- [ ] Mobile responsive
- [ ] Dark mode working
- [ ] Crisis flow tested
- [ ] Ready for deployment

**Tested by:** [Name]  
**Date:** [Date]  
**Notes:** 

---
