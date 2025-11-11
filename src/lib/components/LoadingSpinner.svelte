<script lang="ts">
	export let message: string = 'Loading...';
</script>

<div class="flex flex-col items-center justify-center py-12">
	<div class="relative">
		<div
			class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"
		></div>
		<div
			class="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-secondary-500 rounded-full animate-spin-slow"
		></div>
	</div>
	<p class="mt-4 text-gray-600 font-medium">{message}</p>
</div>
