<script>
import S1 from '../components/S1.svelte';
import S2 from '../components/S2.svelte';
import S3 from '../components/S3.svelte';
import S4 from '../components/S4.svelte';
import S5 from '../components/S5.svelte';
import S6 from '../components/S6.svelte';
import S7 from '../components/S7.svelte';
import S8 from '../components/S8.svelte';
import S9 from '../components/S9.svelte';
import S10 from '../components/S10.svelte';
import S11 from '../components/S11.svelte';
import S12 from '../components/S12.svelte';

let selected;

let questions = [
  { path: 'rsi', name: `Retraso en solicitar cédula de identidad` },
  { path: 'exr', name: `Quedarse en Chile con el permiso de residencia o permanencia expirado por 180 días o menos` },
  { path: 'cdn', name: `Incumplimiento de la obligación de informar cambio de domicilio.` },
  { path: 'rsa', name: `Desarrollo de actividades remuneradas sin autorización`},
  { path: 'tzf', name: `Transgresión de la Zona Fronteriza`},
  { path: 'scm', name: `Salir del país sin realizar control migratorio`},
  { path: 'ex1', name: `Empleo de extranjeros sin autorización: Micro empresa`},
  { path: 'ex2', name: `Empleo de extranjeros sin autorización: Pequeña empresa`},
  { path: 'ex3', name: `Empleo de extranjeros sin autorización: Mediana empresa`},
  { path: 'ex4', name: `Empleo de extranjeros sin autorización: Gran empresa`},
  { path: 'asa', name: `Arrendamiento o subarrendamiento abusivo`},
  { path: 'qre', name: `Quedarse en Chile con el permiso de residencia o permanencia expirado por 180 días o más`}
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
    {#if selected.path=="rsi"}
    <S1 />
    {:else if selected.path=="exr"}
    <S2 />
    {:else if selected.path=="cdn"}
    <S3 />
    {:else if selected.path=="rsa"}
    <S4 />
    {:else if selected.path=="tzf"}
    <S5 />
    {:else if selected.path=="scm"}
    <S6 />
    {:else if selected.path=="ex1"}
    <S7 />
    {:else if selected.path=="ex2"}
    <S8 />
    {:else if selected.path=="ex3"}
    <S9 />
    {:else if selected.path=="ex4"}
    <S10 />
    {:else if selected.path=="asa"}
    <S11 />
    {:else if selected.path=="qre"}
    <S12 />
    {/if}
  {/if}
</div>
</div>
