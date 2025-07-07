# ICRPG Combat Manager - TODO & Feedback

## Feedback from ICRPG Creator

> Pretty slick overall. It immediately feels like an ICRPG tool.
> 
> There is a lot going on, which makes it hard to see how this would play out at the table in real time, but each of the individual tools have some good bones to them and I'm excited to see where each of them end up.

### Specific Notes:

#### Timers and Battlefield
- **Timers and Battlefield feel like they would see the heaviest use, those would be good to have at the top for easy access**

#### Monster Creation
- **Having the tiers there makes it really nice for Quickly adding a monster, but it would be nice to have more control on individual pieces of the monster. You've hidden additional controls in the edit screen after the monster has been added. Those would be nice to surface more. Need both paths.**
> Add a settings modal for the whole app, with a toggle for "advanced mode" that would show the advanced controls for the monster creation form. We could also add a more visible edit button for the monster cards.

#### Timer Improvements
- **Timers would be a great tool to have on the phone and like that it has options for Rounds and Turns. I wish the randomize was attached to the duration and not the name. Also really cool to see the timer connected to the Battlefield Next Turn/Round buttons**
> Add a randomize button to the duration field.

#### Battlefield Enhancements
- **Battlefield feels like the king piece for the tool, but feels a little disjointed. Really like the conditions and the damage buttons, but wish the bonus and action details were more prominent. You'd probably also need a way to add health back in. It could also be nice to have some sort of indicator that they monster has taken their turn this round. Also there is a lot of scrolling if you have more than a few monsters**
> Add a health restoration button to the monster cards.
> Add a button that checks the monster as done turn.
> Create some sort of a way that makes the monster not take so much space while still giving the user the ability to see the monster's details.
> Make the monster bonus and action details more prominent (stand out more), maybe with a big colored +X.

#### Combat Mechanics
- **Combat Mechanics feels like it should be named Target, but love the buttons and the calculations there. Really like the result readout except I have no idea what it means between True Random and Psuedo Random.**
> Make the true random default with a warning if fetch fails explaining that it's a fallback.
> Add info about what's the difference between true and pseudo random.
> Rename "Combat Mechanics" to "Target".
> Create a more clear info about what happened on critical hit.

#### Additional Thoughts
- Make the app more desktop friendly by moving different sections to the screen sides.

### Overall Assessment
> All in all, excellent work. I think there is a lot going for it, and if you refine that experience for seamless mobile play, I think you've got a winner 🔥

---

## Technical Implementation Thoughts

### High Priority Tasks

#### 1. Layout Reorganization ✅
- **Move Timers and Battlefield to top** - These are the most used features ✅
- **Consider collapsible sections** for less frequently used tools ✅
- **Mobile-first responsive design** improvements ✅
- **Desktop-friendly layout** - Move different sections to screen sides

#### 2. Monster Creation Enhancement
- **Add settings modal** with "advanced mode" toggle for monster creation ✅
- **Surface advanced controls** in the main creation form when advanced mode is on ✅
- **Keep both paths**: Quick creation AND detailed creation ✅
- **Add more visible edit button** for monster cards
- **Consider inline editing** for monster properties

#### 3. Timer Improvements ✅
- **Add randomize button to duration field** instead of name ✅
- **Add duration presets** (1, 2, 3, 5, 10 rounds/turns)
- **Consider timer categories** (environmental, monster, mission)

#### 4. Battlefield UX Improvements ✅
- **Make bonus/action details more prominent** - Big colored +X display
- **Add turn tracking indicators** - Button to mark monster as "done turn"
- **Add health restoration buttons** to monster cards ✅
- **Implement compact view mode** - Reduce monster card space while keeping details accessible ✅
- **Consider virtual scrolling** or pagination for many monsters
- **Add reset rounds/turns button** ✅
- **Enhanced target info display** - Gradient background, large typography, clear hierarchy ✅
- **Improved empty state handling** - Better visual feedback when no monsters/timers exist ✅

#### 5. Combat Mechanics Clarification ✅
- **Rename "Combat Mechanics" to "Target"**
- **Make True Random default** with fallback warning if fetch fails ✅
- **Add tooltips/info** explaining True Random vs Pseudo Random difference ✅
- **Create clearer critical hit information** display ✅
- **Remove random source info** from last roll result display ✅
- **Consider visual indicators** for random type selection

### Medium Priority Tasks

#### 6. Mobile Optimization ✅ 
- **Touch-friendly button sizes** ✅
- **Enter key support** for forms - Quick monster entry, monster edit, timer creation, target input, and damage dialogs ✅
- **Swipe gestures** for common actions
- **Offline functionality** considerations
- **Progressive Web App** features

#### 7. Monster Management
- **Bulk operations** (damage all, heal all, etc.)
- **Monster templates** for common types
- **Import/export** functionality
- **Monster search/filter**

#### 8. Timer Enhancements
- **Timer categories** and organization
- **Timer presets** for common scenarios
- **Timer notifications** and alerts
- **Timer history** tracking

### Low Priority Tasks

#### 9. Advanced Features
- **Initiative tracking** system
- **Monster AI** suggestions
- **Combat log** and history
- **Session management** (save/load encounters)

#### 10. Polish & UX
- **Animations** and transitions ✅
- **Sound effects** (optional)
- **Theme customization**
- **Accessibility** improvements
- **Footer with license and attribution** ✅
- **Hover delay composable** - Reusable library for intentional hover behavior ✅
- **Consistent icon system** - PNG icons with CSS filters for color manipulation ✅
- **Button sizing improvements** - Scaled down primary buttons for better proportions ✅
- **Form input consistency** - Fixed height for input and select elements ✅

---

## Recent Updates (Latest)

### Critical Hit Enhancement ✅
- **Detailed critical hit breakdown** - Shows base effort and d12 bonus separately
- **Enhanced AttackResult interface** - Added baseEffort and criticalBonus fields
- **Clear visual feedback** - Warning-colored breakdown box with explanation

### UI/UX Improvements ✅
- **Consistent icon system** - Replaced SVG icons with custom PNG icons using CSS filters
- **Button sizing optimization** - Reduced primary button padding for better proportions
- **Form consistency** - Fixed input/select height differences in timer creation
- **Enhanced target display** - Gradient background and improved typography hierarchy
- **Better empty states** - Improved visual feedback for empty battlefield and roll results

### Code Quality ✅
- **Removed random source info** - Cleaner roll result display without technical details
- **Improved type safety** - Enhanced AttackResult interface with detailed breakdown fields
- **Consistent styling** - Unified icon system across all components

---

*Last updated: 01.07.2025*
*Priority: Mobile optimization and core UX improvements* 