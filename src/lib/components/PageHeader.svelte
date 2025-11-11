<script lang="ts">
	export let title: string;
	export let description: string;
	export let icon: string = '📄';
	export let backLink: string = '/';
</script>

<div class="mb-8 animate-slide-down">
	<a
		href={backLink}
		class="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-4 transition-colors group"
	>
		<svg
			class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
		Back to Dashboard
	</a>

	<div class="flex items-center space-x-4">
		<div
			class="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-3xl shadow-xl"
		>
			{icon}
		</div>
		<div>
			<h1 class="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
			<p class="text-lg text-gray-600">{description}</p>
		</div>
	</div>
</div>
