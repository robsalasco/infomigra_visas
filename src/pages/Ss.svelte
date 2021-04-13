<script>
import S1 from '../components/S1.svelte';
import S2 from '../components/S2.svelte';
import S3 from '../components/S3.svelte';
import S4 from '../components/S4.svelte';

let selected;

let questions = [
  { path: 'si', name: `Estatus Irregular` },
  { path: 'tp', name: `Trabajar sin permiso de trabajo` },
  { path: 'sm', name: `Sanción empleador natural` },
  { path: 'sj', name: `Sanción para empleador juridico`}
];

</script>

<style>
</style>

<div class="container mx-auto h-full flex justify-center items-center">
  <div class="w-4/5">
	<h2>Valor de la sanciones según cantidad de días y forma de presentación (pesos chilenos)</h2>

<div class="inline-block relative w-full mt-4">
    <label class="block uppercase tracking-wide text-white text-xs font-bold mb-2" for="contryselection">Seleccione tipo de sanción</label>
      <div class="relative">
      <select bind:value={selected} class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline text-sm">
       {#each questions as data1}
       <option value={data1}>
        {data1.name}
       </option>
       {/each}
    </select>
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
      <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
  </div>
  {#if selected}
    {#if selected.path=="si"}
    <S1 />
    {:else if selected.path=="tp"}
    <S2 />
    {:else if selected.path=="sm"}
    <S3 />
    {:else if selected.path=="sj"}
    <S4 />
    {/if}
  {/if}
</div>
</div>
