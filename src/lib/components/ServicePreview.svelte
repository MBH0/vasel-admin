<script lang="ts">
	export let service: any;
	export let language: 'es' | 'en';

	const languageConfig = {
		es: {
			flag: '🇪🇸',
			title: 'Spanish Version',
			bgClass: 'from-blue-50 to-indigo-50',
			borderClass: 'border-blue-200',
			badgeClass: 'bg-blue-100 text-blue-800'
		},
		en: {
			flag: '🇬🇧',
			title: 'English Version',
			bgClass: 'from-emerald-50 to-teal-50',
			borderClass: 'border-emerald-200',
			badgeClass: 'bg-emerald-100 text-emerald-800'
		}
	};

	const config = languageConfig[language];
</script>

<div class="bg-gradient-to-br {config.bgClass} rounded-xl p-6 border {config.borderClass} space-y-6">
	<!-- Header -->
	<div class="flex items-center mb-4 pb-4 border-b border-gray-200">
		<span class="text-2xl mr-2">{config.flag}</span>
		<h3 class="text-xl font-bold text-gray-900">{config.title}</h3>
	</div>

	<!-- Basic Info -->
	<div class="bg-white rounded-lg p-4 space-y-3">
		<div>
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Service Name</p>
			<p class="text-2xl font-bold text-gray-900 mt-1">{service.name}</p>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price Range</p>
				<p class="text-sm text-gray-900 mt-1 font-medium">{service.price_range}</p>
			</div>
			<div>
				<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</p>
				<p class="text-sm text-gray-900 mt-1 font-medium">{service.duration}</p>
			</div>
			<div>
				<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Complexity</p>
				<p class="text-sm text-gray-900 mt-1 font-medium">{service.complexity}</p>
			</div>
			<div>
				<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Success Rate</p>
				<p class="text-sm text-green-600 mt-1 font-bold">{service.success_rate}</p>
			</div>
		</div>

		<div>
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</p>
			<code class="text-sm bg-gray-100 px-2 py-1 rounded mt-1 inline-block">{service.slug}</code>
		</div>
	</div>

	<!-- Description -->
	<div class="bg-white rounded-lg p-4">
		<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
		<p class="text-sm text-gray-700 leading-relaxed">{service.description}</p>
	</div>

	<!-- Target Audience -->
	{#if service.target_audience}
		<div class="bg-white rounded-lg p-4">
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Target Audience</p>
			<p class="text-sm text-gray-700">{service.target_audience}</p>
		</div>
	{/if}

	<!-- Benefits -->
	{#if service.benefits}
		<div class="bg-white rounded-lg p-4">
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Benefits</p>
			<ul class="space-y-2">
				{#each service.benefits.split('\n').filter(b => b.trim()) as benefit}
					<li class="flex items-start">
						<svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
						<span class="text-sm text-gray-700">{benefit}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Process Steps -->
	{#if service.process_steps && service.process_steps.length > 0}
		<div class="bg-white rounded-lg p-4">
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Process Steps</p>
			<div class="space-y-4">
				{#each service.process_steps as step, index}
					<div class="flex">
						<div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm mr-3">
							{step.step}
						</div>
						<div class="flex-1">
							<h4 class="font-semibold text-gray-900 text-sm">{step.title}</h4>
							<p class="text-xs text-gray-600 mt-1">{step.description}</p>
							{#if step.estimated_time}
								<p class="text-xs text-gray-500 mt-1">⏱️ {step.estimated_time}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Required Documents -->
	{#if service.required_documents && service.required_documents.required_documents}
		<div class="bg-white rounded-lg p-4">
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Required Documents</p>
			<ul class="grid grid-cols-1 gap-2">
				{#each service.required_documents.required_documents as doc}
					<li class="flex items-center text-sm text-gray-700">
						<svg class="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
						</svg>
						{doc}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- FAQ -->
	{#if service.faq && service.faq.length > 0}
		<div class="bg-white rounded-lg p-4">
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Frequently Asked Questions ({service.faq.length})</p>
			<div class="space-y-4">
				{#each service.faq as item, index}
					<div class="border-l-2 border-primary-500 pl-4">
						<h4 class="font-semibold text-gray-900 text-sm mb-1">Q: {item.question}</h4>
						<p class="text-xs text-gray-700 leading-relaxed">A: {item.answer}</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Tags -->
	{#if service.tags && service.tags.length > 0}
		<div class="bg-white rounded-lg p-4">
			<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tags</p>
			<div class="flex flex-wrap gap-2">
				{#each service.tags as tag}
					<span class="px-3 py-1 {config.badgeClass} rounded-full text-xs font-medium">
						{tag}
					</span>
				{/each}
			</div>
		</div>
	{/if}

	<!-- SEO -->
	{#if service.SEO}
		<details class="bg-white rounded-lg p-4">
			<summary class="cursor-pointer text-sm font-semibold text-gray-700 hover:text-primary-600">
				🔍 SEO Metadata
			</summary>
			<div class="mt-3 space-y-2 text-xs">
				<div>
					<span class="font-semibold text-gray-600">Meta Title:</span>
					<p class="text-gray-700 mt-1">{service.SEO.metaTitle}</p>
				</div>
				<div>
					<span class="font-semibold text-gray-600">Meta Description:</span>
					<p class="text-gray-700 mt-1">{service.SEO.metaDescription}</p>
				</div>
				<div>
					<span class="font-semibold text-gray-600">Keywords:</span>
					<p class="text-gray-700 mt-1">{service.SEO.keywords.join(', ')}</p>
				</div>
			</div>
		</details>
	{/if}

	<!-- Full JSON -->
	<details class="mt-4">
		<summary class="cursor-pointer text-sm font-semibold text-gray-700 hover:text-primary-600">
			📄 View Full JSON
		</summary>
		<pre class="mt-3 text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">{JSON.stringify(service, null, 2)}</pre>
	</details>
</div>
