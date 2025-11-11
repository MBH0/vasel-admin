<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	const navigation = [
		{ name: 'Dashboard', href: '/', icon: '🏠' },
		{ name: 'Services', href: '/services', icon: '📋' },
		{ name: 'Blogs', href: '/blogs', icon: '✍️' },
		{ name: 'Manage', href: '/manage', icon: '⚙️' }
	];

	$: currentPath = $page.url.pathname;
	$: showLayout = data.isAuthenticated && !data.isLoginPage;

	async function handleLogout() {
		if (confirm('Are you sure you want to logout?')) {
			await fetch('/api/auth/logout', { method: 'POST' });
			goto('/login');
		}
	}
</script>

{#if showLayout}
<div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
	<!-- Navigation -->
	<nav class="bg-white border-b border-gray-200 shadow-sm">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex">
					<!-- Logo -->
					<div class="flex-shrink-0 flex items-center">
						<a href="/" class="flex items-center space-x-3">
							<div
								class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-md"
							>
								V
							</div>
							<span class="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
								Vasel Admin
							</span>
						</a>
					</div>

					<!-- Navigation Links -->
					<div class="hidden sm:ml-8 sm:flex sm:space-x-4">
						{#each navigation as item}
							<a
								href={item.href}
								class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 {currentPath ===
								item.href
									? 'bg-primary-50 text-primary-700'
									: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
							>
								<span class="mr-2">{item.icon}</span>
								{item.name}
							</a>
						{/each}
					</div>
				</div>

				<!-- Right side - Status and Logout -->
				<div class="flex items-center space-x-4">
					<div class="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-full">
						<div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
						<span class="text-xs font-medium text-emerald-700">System Active</span>
					</div>
					<button
						on:click={handleLogout}
						class="text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-medium text-sm"
					>
						🚪 Logout
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile Navigation -->
		<div class="sm:hidden border-t border-gray-200">
			<div class="flex overflow-x-auto">
				{#each navigation as item}
					<a
						href={item.href}
						class="flex-1 inline-flex flex-col items-center px-4 py-3 text-xs font-medium transition-colors {currentPath ===
						item.href
							? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500'
							: 'text-gray-600 hover:bg-gray-50'}"
					>
						<span class="text-lg mb-1">{item.icon}</span>
						{item.name}
					</a>
				{/each}
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="animate-fade-in">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="bg-white border-t border-gray-200 mt-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="text-center text-sm text-gray-600">
				<p>© 2024 Vasel Legal & Migration - Admin Tool</p>
				<p class="mt-1 text-xs text-gray-500">
					Powered by OpenAI GPT-4o · Built with SvelteKit
				</p>
			</div>
		</div>
	</footer>
</div>
{:else}
	<slot />
{/if}
