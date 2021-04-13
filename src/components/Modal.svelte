<script>
import { onMount } from 'svelte';

function toggleModal () {
	const modal = document.querySelector('.modal')
	modal.classList.toggle('opacity-0')
	modal.classList.toggle('pointer-events-none')
};

onMount(() => {
	const overlay = document.querySelector('.modal-overlay');
	overlay.addEventListener('click', toggleModal);
});
</script>

<style>
.modal {
  transition: opacity 0.25s ease;
}
</style>

<svelte:window on:load={toggleModal} />

<div class="modal opacity-0 pointer-events-none absolute w-full h-full top-0 left-0 flex items-center justify-center">
  <div class="modal-overlay absolute w-full h-full bg-black opacity-25 top-0 left-0 cursor-pointer"></div>
  <div class="absolute w-1/2 h-32 bg-white rounded-sm shadow-lg flex items-center justify-center text-2xl">🚀</div>
</div>
