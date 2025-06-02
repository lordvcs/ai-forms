<script lang="ts">
	import AI from '$lib/ai';
	import AiForm from '$lib/ai-form';
	import Transcriber from '$lib/transcriber';
	import { pipeline, type AutomaticSpeechRecognitionOutput } from '@huggingface/transformers';

	AI.loadPipelines();

	let audioUrl = $state('');
	let transcriptText = $state('');
	let isRecording = $state(false);
	const toggleRecording = () => {
		if (isRecording) {
			isRecording = false;
			Transcriber.stopRecording();
		} else {
			isRecording = true;
			Transcriber.startRecording().then(async (audioBlob) => {
				audioUrl = URL.createObjectURL(audioBlob);
				const transcriber = await AI.getTranscriber();
				const audioData = await Transcriber.blobToAudioData(audioBlob);
				const output = (await transcriber(audioData, {
					top_k: 0,
					do_sample: false,
					chunk_length_s: 30, // Process in 30-second chunks
					stride_length_s: 5 // Overlap chunks by 5 seconds for better continuity
				})) as AutomaticSpeechRecognitionOutput;
				console.log('output', output);
				transcriptText = output.text;
				AiForm.fillFormFromText(output.text);
			});
		}
	};
</script>

<button
	id="recordButton"
	class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
	onclick={toggleRecording}
>
	{isRecording ? 'Stop' : 'Start'} Recording
</button>
<p>
	Transcript:
	<code>{transcriptText}</code>
</p>
<audio id="audio" controls src={audioUrl}></audio>

<div class="mx-auto max-w-2xl rounded-md bg-white p-8 shadow-lg">
	<p class="mb-6 text-xs text-gray-600">
		Fields marked with <span class="text-red-500">*</span> are required
	</p>

	<h1 class="mb-2 text-2xl font-semibold text-gray-800">Information About Me</h1>
	<p class="mb-6 text-sm text-gray-500">Step 1 of 2</p>

	<form action="#" method="POST" autocomplete="off">
		<div class="space-y-6">
			<!-- <div> -->
			<!-- 	<label for="name" class="block text-sm font-medium text-gray-700" -->
			<!-- 		>Name<span class="text-red-500">*</span></label -->
			<!-- 	> -->
			<!-- 	<input -->
			<!-- 		type="text" -->
			<!-- 		name="name" -->
			<!-- 		id="name" -->
			<!-- 		data-ai-name="name" -->
			<!-- 		required -->
			<!-- 		class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm" -->
			<!-- 	/> -->
			<!-- </div> -->

			<div>
				<label for="first-name" class="block text-sm font-medium text-gray-700"
					>first Name<span class="text-red-500">*</span></label
				>
				<input
					type="text"
					name="first-name"
					id="first-name"
					data-ai-name="first name"
					required
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
				/>
			</div>

			<div>
				<label for="last-name" class="block text-sm font-medium text-gray-700"
					>Last Name<span class="text-red-500">*</span></label
				>
				<input
					type="text"
					name="last-name"
					id="last-name"
					data-ai-name="last name"
					required
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
				/>
			</div>

			<div>
				<label for="city" class="block text-sm font-medium text-gray-700"
					>City<span class="text-red-500">*</span></label
				>
				<input
					type="text"
					name="city"
					id="city"
					data-ai-name="city"
					required
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
				/>
			</div>

			<!-- <div> -->
			<!-- 	<label for="state" class="block text-sm font-medium text-gray-700" -->
			<!-- 		>State<span class="text-red-500">*</span></label -->
			<!-- 	> -->
			<!-- 	<input -->
			<!-- 		type="text" -->
			<!-- 		name="state" -->
			<!-- 		id="state" -->
			<!-- 		required -->
			<!-- 		class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm" -->
			<!-- 	/> -->
			<!-- </div> -->
			<!---->
			<!-- <div> -->
			<!-- 	<label for="zip" class="block text-sm font-medium text-gray-700" -->
			<!-- 		>Zip<span class="text-red-500">*</span></label -->
			<!-- 	> -->
			<!-- 	<input -->
			<!-- 		type="text" -->
			<!-- 		name="zip" -->
			<!-- 		id="zip" -->
			<!-- 		required -->
			<!-- 		class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm" -->
			<!-- 	/> -->
			<!-- </div> -->

			<div>
				<label for="contract-number" class="block text-sm font-medium text-gray-700"
					>Contract Number</label
				>
				<input
					type="text"
					name="contract-number"
					id="contract-number"
					data-ai-name="the contract number"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
				/>
			</div>
		</div>
	</form>
</div>
