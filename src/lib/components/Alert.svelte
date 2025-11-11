<script lang="ts">
	export let type: 'error' | 'success' | 'warning' | 'info' = 'info';
	export let message: string;

	const styles = {
		error: 'bg-red-50 text-red-800 border-red-200',
		success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
		warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
		info: 'bg-blue-50 text-blue-800 border-blue-200'
	};

	const icons = {
		error: '❌',
		success: '✅',
		warning: '⚠️',
		info: 'ℹ️'
	};
</script>

<div class="rounded-lg border-2 p-4 {styles[type]} animate-slide-down">
	<div class="flex items-start">
		<span class="text-2xl mr-3 flex-shrink-0">{icons[type]}</span>
		<p class="flex-1 font-medium">{message}</p>
	</div>
</div>
