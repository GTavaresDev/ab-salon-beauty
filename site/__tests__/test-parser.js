// Test script to demonstrate HTML parsing
// Run with: node test-parser.js

function parseGoogleReviewHTML(html, authorName) {
  const KEYWORDS = ["sobrancelha", "atendimento", "resultado", "profissional"];
  const MIN_REVIEW_LENGTH = 35;
  const MIN_RATING = 4;

  try {
    // Extract rating (count the star spans)
    const starRegex = /<span class="hCCjke google-symbols NhBTye elGi1d"/g;
    const starMatches = html.match(starRegex);
    const rating = starMatches ? starMatches.length : 0;

    if (rating < MIN_RATING) {
      return null;
    }

    // Extract date
    const dateRegex = /<span class="rsqaWe">([^<]+)<\/span>/;
    const dateMatch = html.match(dateRegex);
    const relativeDate = dateMatch ? dateMatch[1] : "";

    // Extract comment
    const commentRegex = /<span class="wiI7pd">([^<]+)<\/span>/;
    const commentMatch = html.match(commentRegex);
    const comment = commentMatch ? commentMatch[1].trim() : "";

    // Check minimum length
    if (comment.length < MIN_REVIEW_LENGTH) {
      return null;
    }

    // Extract author from button if not provided
    let author = authorName || "Unknown";
    if (!authorName) {
      const authorRegex = /aria-label="Share ([^']+)'s review\./;
      const authorMatch = html.match(authorRegex);
      if (authorMatch) {
        author = authorMatch[1];
      }
    }

    // Convert relative date to ISO format
    function convertRelativeDateToISO(relativeDate) {
      const now = new Date();
      const dateString = relativeDate.toLowerCase().trim();

      const numberMatch = dateString.match(/(\d+)/);
      if (!numberMatch) {
        return now.toISOString().split("T")[0];
      }

      const amount = parseInt(numberMatch[1], 10);
      let date = new Date(now);

      if (dateString.includes("year")) {
        date.setFullYear(date.getFullYear() - amount);
      } else if (dateString.includes("month")) {
        date.setMonth(date.getMonth() - amount);
      } else if (dateString.includes("week")) {
        date.setDate(date.getDate() - amount * 7);
      } else if (dateString.includes("day")) {
        date.setDate(date.getDate() - amount);
      } else if (dateString.includes("hour")) {
        date.setHours(date.getHours() - amount);
      }

      return date.toISOString().split("T")[0];
    }

    const date = convertRelativeDateToISO(relativeDate);

    return {
      author,
      rating,
      comment,
      date,
    };
  } catch (error) {
    console.error("Error parsing review HTML:", error);
    return null;
  }
}

// Test with the HTML provided
const testHTML = `<div class="GHT2ce" data-irrelevant-review-text-id="ucc-17"><div class="DU9Pgb"><span class="kvMYJc" role="img" aria-label="5 stars"><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span></span><span class="rsqaWe">2 years ago</span><div class="Tuisuc"></div></div><div> <div class="MyEned" tabindex="-1" id="ucc-17" lang="pt"><span class="wiI7pd">Atendimento impecável! Indico para todas as minhas amigas. Melhor lugar para fazer as sobrancelhas e cílios.</span></div></div><div class="oqftme"><button class="kyuRq fontTitleSmall WOKzJe" role="switch" aria-checked="false" aria-controls="ucc-17" data-review-id="ChdDSUhNMG9nS0VJQ0FnSUNGeGZUam93RRAB" jsaction="pane.wfvdle104.review.showReviewInTranslation" jslog="170843; track:click; mutable:true;metadata:WyIwYWhVS0V3akdtZl9qaWU2VEF4VW9JUjRBSFJYNE52WVEwcE1GQ0Fzb0F3Il0="> <span>See translation (English)</span></button></div><div style="clear: both;"></div><div class="Upo0Ec"><button class="gllhef" aria-pressed="false" data-review-id="ChdDSUhNMG9nS0VJQ0FnSUNGeGZUam93RRAB" jslog="25807; track:click;metadata:WyIwYWhVS0V3akdtZl9qaWU2VEF4VW9JUjRBSFJYNE52WVEwcE1GQ0Fzb0F3Il0=" aria-label="Like" title="Like" jsaction="pane.wfvdle104.review.toggleThumbsUp; keydown:pane.wfvdle104.review.toggleThumbsUp"><div class="GBkF3d "><div class="Gd9ibe OyjIsf "></div><span class="dSlJg google-symbols" aria-hidden="true" style="font-size: 18px;"></span><span class="NlVald znYl0"><span>Like</span></span></div></button><button class="gllhef" jslog="32949; track:click" data-review-id="ChdDSUhNMG9nS0VJQ0FnSUNGeGZUam93RRAB" aria-label="Share Isadora Gabrielly Campos's review." jsaction="pane.wfvdle104.review.share; keydown:pane.wfvdle104.review.share"><div class="GBkF3d"><div class="Gd9ibe OyjIsf "></div><span class="dSlJg google-symbols" aria-hidden="true" style="font-size: 18px;"></span> <span class="NlVald znYl0">Share</span></div></button></div></div>`;

const result = parseGoogleReviewHTML(testHTML, "Isadora Gabrielly Campos");

console.log("\n✅ Successfully parsed Google Review HTML:\n");
console.log(JSON.stringify(result, null, 2));
