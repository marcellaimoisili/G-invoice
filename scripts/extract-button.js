import { readFileSync } from 'fs';

const html = readFileSync('/vercel/share/v0-project/user_read_only_context/text_attachments/pasted-text-CmpCc.txt', 'utf8');

// Extract the button element
const buttonMatch = html.match(/<button[^>]*type="submit"[^>]*>[\s\S]*?<\/button>/);
if (buttonMatch) {
  console.log("BUTTON ELEMENT:");
  console.log(buttonMatch[0]);
} else {
  console.log("No button found");
}

// Also extract just classes from the button
const classMatch = html.match(/<button[^>]*type="submit"[^>]*class="([^"]*)"/);
if (classMatch) {
  console.log("\nBUTTON CLASSES:");
  console.log(classMatch[1]);
}

// Extract everything between "Calculate" and the end of button
const calcMatch = html.match(/bg-orange[^"]*"/);
if (calcMatch) {
  console.log("\nBG-ORANGE CONTEXT:");
  console.log(calcMatch[0]);
}

// Find the rounded class near the button
const roundedMatch = html.match(/rounded-[a-z]+[^"]*bg-orange/);
if (roundedMatch) {
  console.log("\nROUNDED NEAR BUTTON:");
  console.log(roundedMatch[0]);
}
