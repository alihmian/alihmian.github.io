// Example if you had submenus. Not needed if all items are top-level:
document.querySelectorAll('#sidebar-nav .parent').forEach(parentLi => {
    const subMenu = parentLi.querySelector('ul');
    if (subMenu) {
        // Hide by default
        subMenu.classList.add('hidden');

        // Toggle on click
        parentLi.querySelector('a').addEventListener('click', (evt) => {
            evt.preventDefault();
            subMenu.classList.toggle('hidden');
        });
    }
});
