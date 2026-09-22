// The treat shop's catalogue: enough products that the page scrolls on
// every device, the laptop included.

export interface Treat {
  id: string;
  emoji: string;
  name: string;
  price: number;
  blurb: string;
}

export const TREATS: Treat[] = [
  { id: "tuna", emoji: "🐟", name: "Tuna flakes", price: 3, blurb: "The classic. Opened with a can opener you will hear from any room." },
  { id: "salmon", emoji: "🍣", name: "Salmon bites", price: 5, blurb: "For finishing a chapter. Or starting one. Or thinking about it." },
  { id: "catnip", emoji: "🌿", name: "Catnip pouch", price: 4, blurb: "Improves prose by 0%. Improves mood by a lot." },
  { id: "chicken", emoji: "🍗", name: "Chicken crunch", price: 3, blurb: "Crunchy outside, crunchy inside. Mostly crunch." },
  { id: "cream", emoji: "🥛", name: "Cream saucer", price: 6, blurb: "Not recommended by anyone. Ordered by everyone." },
  { id: "shrimp", emoji: "🦐", name: "Shrimp tails", price: 7, blurb: "A reward for key-mashes longer than ten characters." },
  { id: "laser", emoji: "🔴", name: "Laser dot", price: 2, blurb: "Not food. Still somehow a treat. Cannot be caught." },
  { id: "box", emoji: "📦", name: "Empty box", price: 1, blurb: "The product came in it. The box is the product." },
  { id: "yarn", emoji: "🧶", name: "Yarn ball", price: 2, blurb: "Unravels at the same rate as the plot." },
  { id: "mouse", emoji: "🐭", name: "Toy mouse", price: 3, blurb: "Will be found under the sofa in six to eight months." },
  { id: "sunbeam", emoji: "☀️", name: "Sunbeam, 2pm", price: 9, blurb: "Limited daily supply. Moves across the floor." },
  { id: "keyboard", emoji: "⌨️", name: "Warm keyboard", price: 0, blurb: "You're sitting on it. Free with every draft." },
];
