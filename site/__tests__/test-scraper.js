// Test script for scraping multiple reviews from HTML
// Run with: node test-scraper.js

function parseGoogleReviewHTML(html, authorName) {
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
    const fullCommentRegex =
      /<span class="wiI7pd">([^<]+)(?:<\/span>\s*<span>|<\/span>)/;
    const commentMatch = html.match(fullCommentRegex);
    const comment = commentMatch ? commentMatch[1].trim() : "";

    // Check minimum length
    if (comment.length < MIN_REVIEW_LENGTH) {
      return null;
    }

    // Extract author from aria-label if not provided
    let author = authorName || "Unknown";

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

function extractAllReviewsFromHTML(html) {
  const reviews = [];

  try {
    // Split by review containers - each review is wrapped in aria-label with author name
    const reviewContainerRegex =
      /<div class="jftiEf fontBodyMedium "\s+aria-label="([^"]+)"\s+data-review-id="[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;

    let match;
    while ((match = reviewContainerRegex.exec(html)) !== null) {
      const authorName = match[1];
      const reviewBlockHtml = match[0];

      const review = parseGoogleReviewHTML(reviewBlockHtml, authorName);
      if (review) {
        reviews.push(review);
      }
    }
  } catch (error) {
    console.error("Error extracting reviews from HTML:", error);
  }

  return reviews;
}

// Load the HTML from a file (or you can paste it directly)
const fs = require("fs");
const path = require("path");

// Create a sample HTML file with the complete reviews HTML
const sampleHtml = `<div class="m6QErb DxyBCb kA9KIf dS8AEf XiKgde " tabindex="-1"><div class="jftiEf fontBodyMedium " aria-label="Vitoria Naciff lima" data-review-id="ChZDSUhNMG9nS0VJQ0FnSURManJfeWJREAE"><div class="GHT2ce" data-irrelevant-review-text-id="ucc-14"><div class="DU9Pgb"><span class="kvMYJc" role="img" aria-label="5 stars"><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span></span><span class="rsqaWe">a year ago</span></div><div><div class="MyEned" tabindex="-1" id="ucc-14" lang="pt"><span class="wiI7pd">Encantada com o atendimento! Além de me encaixar em um horário que eu podia com urgência, me atendeu com muita atenção e educação.</span></div></div></div></div></div><div class="jftiEf fontBodyMedium " aria-label="Beatriz Xoimbra" data-review-id="ChZDSUhNMG9nS0VJQ0FnSUREek9yVFhnEAE"><div class="GHT2ce" data-irrelevant-review-text-id="ucc-15"><div class="DU9Pgb"><span class="kvMYJc" role="img" aria-label="5 stars"><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span></span><span class="rsqaWe">2 years ago</span></div><div><div class="MyEned" tabindex="-1" id="ucc-15" lang="pt"><span class="wiI7pd">O ateliê mais lindo e aconchegante!! As meninas são super atenciosas!! As meninas buscam valorizar as sobrancelhas naturais.</span></div></div></div></div></div><div class="jftiEf fontBodyMedium " aria-label="larissa araujo" data-review-id="ChdDSUhNMG9nS0VJQ0FnSURXOU9HcTR3RRAB"><div class="GHT2ce" data-irrelevant-review-text-id="ucc-16"><div class="DU9Pgb"><span class="kvMYJc" role="img" aria-label="5 stars"><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span></span><span class="rsqaWe">4 years ago</span></div><div><div class="MyEned" tabindex="-1" id="ucc-16" lang="pt"><span class="wiI7pd">A melhor sem dúvidas 😍 se você quer sobrancelhas perfeitas o lugar é aqui! super indico , as melhores profissionais e o melhor atendimento.</span></div></div></div></div></div><div class="jftiEf fontBodyMedium " aria-label="Isadora Gabrielly Campos" data-review-id="ChdDSUhNMG9nS0VJQ0FnSUNGeGZUam93RRAB"><div class="GHT2ce" data-irrelevant-review-text-id="ucc-17"><div class="DU9Pgb"><span class="kvMYJc" role="img" aria-label="5 stars"><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span><span class="hCCjke google-symbols NhBTye elGi1d" aria-hidden="true" style="font-size: 16px;"></span></span><span class="rsqaWe">2 years ago</span></div><div><div class="MyEned" tabindex="-1" id="ucc-17" lang="pt"><span class="wiI7pd">Atendimento impecável! Indico para todas as minhas amigas. Melhor lugar para fazer as sobrancelhas e cílios.</span></div></div></div></div></div></div>`;

// Extract all reviews
const reviews = extractAllReviewsFromHTML(sampleHtml);

console.log(`\n✅ Successfully extracted ${reviews.length} reviews from HTML:\n`);
console.log(JSON.stringify(reviews, null, 2));

console.log(`\n📊 Summary:`);
console.log(`   Total reviews: ${reviews.length}`);
console.log(`   Average rating: ${(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} ⭐`);
console.log(`   Authors: ${reviews.map((r) => r.author).join(", ")}\n`);
