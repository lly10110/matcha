
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to bubble tea buttons
    const bubbleTeaButtons = document.querySelectorAll('#bubbleTeaButtons button');

    bubbleTeaButtons.forEach(button => {

        button.addEventListener('click', () => {
            const selectedBubbleTeas = document.getElementById('selectedBubbleTeas');
            const bubbleTeaName = button.value;
            const existingBubbleTea = document.querySelector(`#selectedBubbleTeas [data-bubble-tea="${bubbleTeaName}"]`);

            if (existingBubbleTea) {
                existingBubbleTea.remove();
            } else {
                const newBubbleTea = document.createElement('div');
                newBubbleTea.textContent = bubbleTeaName;
                newBubbleTea.dataset.bubbleTea = bubbleTeaName;
                selectedBubbleTeas.appendChild(newBubbleTea);
            }
        });
    });
});