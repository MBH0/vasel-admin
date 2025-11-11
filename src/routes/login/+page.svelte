<script lang="ts">
	import { goto } from '$app/navigation';

	let password = '';
	let error = '';
	let loading = false;

	async function handleLogin() {
		if (!password) {
			error = 'Please enter a password';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Invalid password');
			}

			// Redirect to dashboard on success
			goto('/');
		} catch (err: any) {
			error = err.message || 'An error occurred';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Vasel Admin</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-purple-600 to-secondary-500 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full">
		<!-- Logo and Title -->
		<div class="text-center mb-8">
			<div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4">
				<span class="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">V</span>
			</div>
			<h1 class="text-4xl font-bold text-white mb-2">Vasel Admin</h1>
			<p class="text-purple-100">Content Management System</p>
		</div>

		<!-- Login Card -->
		<div class="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
			<div class="text-center">
				<h2 class="text-2xl font-bold text-gray-900">Welcome Back</h2>
				<p class="text-gray-600 mt-1">Enter your password to continue</p>
			</div>

			<form on:submit|preventDefault={handleLogin} class="space-y-6">
				<div>
					<label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
						Admin Password
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						placeholder="Enter admin password"
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
						required
						autocomplete="current-password"
					/>
				</div>

				{#if error}
					<div class="rounded-lg bg-red-50 border-2 border-red-200 p-4">
						<div class="flex items-start">
							<span class="text-2xl mr-3">❌</span>
							<p class="text-red-800 font-medium">{error}</p>
						</div>
					</div>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full btn-primary flex items-center justify-center"
				>
					{#if loading}
						<svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Signing in...
					{:else}
						🔐 Sign In
					{/if}
				</button>
			</form>

			<div class="text-center pt-4 border-t border-gray-200">
				<p class="text-sm text-gray-500">
					Protected Area · Authorized Access Only
				</p>
			</div>
		</div>

		<div class="text-center mt-6">
			<p class="text-sm text-purple-100">
				© 2024 Vasel Legal & Migration
			</p>
		</div>
	</div>
</div>
