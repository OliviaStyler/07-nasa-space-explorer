// Add your NASA API key here. DEMO_KEY works for testing but has strict limits.
const apiKey = 'LJpzWQCmhwHfbHDPTqhWRbhhdmkkRfKprnktnHr9';

// Find the controls and page areas we will use.
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const spaceFact = document.getElementById('spaceFact');
const imageModal = document.getElementById('imageModal');
const modalBody = document.getElementById('modalBody');
const closeModalButton = document.getElementById('closeModalButton');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

const spaceFacts = [
	'A day on Venus is longer than a year on Venus.',
	'One million Earths could fit inside the Sun.',
	'Jupiter has the shortest day of any planet, lasting about 10 hours.',
	'Footprints on the Moon can last for millions of years because there is no wind.',
	'Saturn would float in water because its average density is lower than water.'
];

// Show a different space fact whenever the page loads.
spaceFact.innerHTML = `<strong>Did you know?</strong> ${spaceFacts[Math.floor(Math.random() * spaceFacts.length)]}`;

// Fetch APOD entries for the selected date range.
async function getSpaceImages() {
	gallery.innerHTML = '<div class="loading" role="status">Loading space photos...</div>';
	getImagesButton.disabled = true;

	try {
		const requestUrl = `https://science.nasa.gov/wp-json/wp/v2/apod-basic/?api_key=${apiKey}&start_date=${startInput.value}&end_date=${endInput.value}`;
		const response = await fetch(requestUrl);

		if (!response.ok) {
			throw new Error('NASA could not return the selected images.');
		}

		const spaceImages = await response.json();
		const selectedImages = spaceImages.filter((spaceImage) => {
			return spaceImage.date >= startInput.value && spaceImage.date <= endInput.value;
		});
		displayGallery(selectedImages);
	} catch (error) {
		gallery.innerHTML = `<div class="message error">${error.message} Please check your API key and try again.</div>`;
	} finally {
		getImagesButton.disabled = false;
	}
}

// Create one gallery item for each APOD result.
function displayGallery(spaceImages) {
	gallery.innerHTML = spaceImages.map((spaceImage, index) => {
		if (spaceImage.media_type === 'video') {
			return `<article class="gallery-item video-item">
				<div class="video-preview">VIDEO</div>
				<h2>${spaceImage.title}</h2>
				<p>${spaceImage.date}</p>
				<a class="video-link" href="${spaceImage.permalink || spaceImage.url}" target="_blank" rel="noopener">Watch this space video</a>
			</article>`;
		}

		return `<article class="gallery-item" data-image-index="${index}" tabindex="0" role="button" aria-label="View details for ${spaceImage.title}">
			<div class="image-wrap"><img src="${spaceImage.hdurl || spaceImage.url}" alt="${spaceImage.title}" loading="lazy"></div>
			<h2>${spaceImage.title}</h2>
			<p>${spaceImage.date}</p>
		</article>`;
	}).join('');

	gallery.querySelectorAll('.gallery-item[data-image-index]').forEach((item) => {
		item.addEventListener('click', () => openModal(spaceImages[item.dataset.imageIndex]));
		item.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				openModal(spaceImages[item.dataset.imageIndex]);
			}
		});
	});
}

function openModal(spaceImage) {
	modalBody.innerHTML = `<img src="${spaceImage.hdurl || spaceImage.url}" alt="${spaceImage.title}">
		<h2 id="modalTitle">${spaceImage.title}</h2>
		<p class="modal-date">${spaceImage.date}</p>
		<p>${spaceImage.explanation}</p>`;
	imageModal.classList.add('is-open');
	imageModal.setAttribute('aria-hidden', 'false');
	closeModalButton.focus();
}

function closeModal() {
	imageModal.classList.remove('is-open');
	imageModal.setAttribute('aria-hidden', 'true');
}

getImagesButton.addEventListener('click', getSpaceImages);
closeModalButton.addEventListener('click', closeModal);
imageModal.addEventListener('click', (event) => {
	if (event.target === imageModal) closeModal();
});
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') closeModal();
});

// Load the default date range when the app first opens.
getSpaceImages();
