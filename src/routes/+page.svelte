<script lang="ts">
	import Transcriber from '$lib/transcriber';
	import { pipeline } from '@huggingface/transformers';
	import { onMount } from 'svelte';

	// async function blobToAudioData(blob: Blob) {
	// 	const arrayBuffer = await blob.arrayBuffer();
	// 	const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
	// 		sampleRate: 16000 // Whisper expects 16kHz
	// 	});
	//
	// 	try {
	// 		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
	//
	// 		// Convert to mono if stereo
	// 		let audioData;
	// 		if (audioBuffer.numberOfChannels === 1) {
	// 			audioData = audioBuffer.getChannelData(0);
	// 		} else {
	// 			// Mix down to mono
	// 			const left = audioBuffer.getChannelData(0);
	// 			const right = audioBuffer.getChannelData(1);
	// 			audioData = new Float32Array(left.length);
	// 			for (let i = 0; i < left.length; i++) {
	// 				audioData[i] = (left[i] + right[i]) / 2;
	// 			}
	// 		}
	//
	// 		// Resample to 16kHz if needed
	// 		if (audioBuffer.sampleRate !== 16000) {
	// 			const resampleRatio = audioBuffer.sampleRate / 16000;
	// 			const newLength = Math.floor(audioData.length / resampleRatio);
	// 			const resampledData = new Float32Array(newLength);
	//
	// 			for (let i = 0; i < newLength; i++) {
	// 				const srcIndex = Math.floor(i * resampleRatio);
	// 				resampledData[i] = audioData[srcIndex];
	// 			}
	//
	// 			audioData = resampledData;
	// 		}
	//
	// 		return audioData;
	// 	} catch (error) {
	// 		console.error('Error processing audio:', error);
	// 		throw error;
	// 	}
	// }
	//
	onMount(async () => {
		console.log('onMount');
		const answerer = await pipeline(
			'question-answering',
			'Xenova/distilbert-base-uncased-distilled-squad',
			{
				progress_callback: (progress) => {
					if (progress.status == 'done') {
						console.log('QA Progress:', progress);
					}
				}
			}
		);
		const question1 = 'what is my age?';
		const question2 = 'What is my email address?';
		const context = 'Hi, my name is john doe and my email address is john@doe.com';
		const questions = [question1, question2];
		console.log('asking question...');
		const answerPromises = questions.map((question) => answerer?.(question, context));
		const answers = await Promise.all(answerPromises);
		for (const answer of answers) {
			console.log('output: ', answer);
		}
	});

	// Convert audio blob to the format expected by Whisper
	// async function blobToAudioData(blob: any) {
	// 	const arrayBuffer = await blob.arrayBuffer();
	// 	const audioContext = new (window.AudioContext || window.webkitAudioContext)({
	// 		sampleRate: 16000 // Whisper expects 16kHz
	// 	});
	//
	// 	try {
	// 		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
	//
	// 		// Convert to mono if stereo
	// 		let audioData;
	// 		if (audioBuffer.numberOfChannels === 1) {
	// 			audioData = audioBuffer.getChannelData(0);
	// 		} else {
	// 			// Mix down to mono
	// 			const left = audioBuffer.getChannelData(0);
	// 			const right = audioBuffer.getChannelData(1);
	// 			audioData = new Float32Array(left.length);
	// 			for (let i = 0; i < left.length; i++) {
	// 				audioData[i] = (left[i] + right[i]) / 2;
	// 			}
	// 		}
	//
	// 		// Resample to 16kHz if needed
	// 		if (audioBuffer.sampleRate !== 16000) {
	// 			const resampleRatio = audioBuffer.sampleRate / 16000;
	// 			const newLength = Math.floor(audioData.length / resampleRatio);
	// 			const resampledData = new Float32Array(newLength);
	//
	// 			for (let i = 0; i < newLength; i++) {
	// 				const srcIndex = Math.floor(i * resampleRatio);
	// 				resampledData[i] = audioData[srcIndex];
	// 			}
	//
	// 			audioData = resampledData;
	// 		}
	//
	// 		return audioData;
	// 	} catch (error) {
	// 		console.error('Error processing audio:', error);
	// 		throw error;
	// 	}
	// }
	console.log('outside onmount');
	let audioUrl = $state('');
	let isRecording = $state(false);
	const toggleRecording = () => {
		if (isRecording) {
			isRecording = false;
			Transcriber.stopRecording();
		} else {
			isRecording = true;
			Transcriber.startRecording().then(async (audioBlob) => {
				audioUrl = URL.createObjectURL(audioBlob);
				// audio.src = audioUrl;
				console.log('recording res: ', audioBlob);
				const transcriber = await pipeline(
					'automatic-speech-recognition',
					'Xenova/whisper-tiny.en'
				);

				// const arrayBuffer = await audioBlob.arrayBuffer();
				// const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
				// // Decode the audio data from the blob
				// const decodedAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
				//
				// // Whisper models expect mono audio at 16kHz sample rate
				// const targetSampleRate = 16000;
				// let audioData;
				//
				// if (
				// 	decodedAudioBuffer.sampleRate === targetSampleRate &&
				// 	decodedAudioBuffer.numberOfChannels === 1
				// ) {
				// 	audioData = decodedAudioBuffer.getChannelData(0);
				// } else {
				// 	// showStatus('Resampling audio...', 'processing');
				// 	// Create an OfflineAudioContext for resampling
				// 	// Calculate new length based on target sample rate
				// 	const newLength = Math.floor(
				// 		decodedAudioBuffer.length * (targetSampleRate / decodedAudioBuffer.sampleRate)
				// 	);
				// 	const offlineContext = new OfflineAudioContext(
				// 		1, // Mono
				// 		newLength,
				// 		targetSampleRate
				// 	);
				//
				// 	const bufferSource = offlineContext.createBufferSource();
				// 	bufferSource.buffer = decodedAudioBuffer;
				// 	bufferSource.connect(offlineContext.destination);
				// 	bufferSource.start();
				//
				// 	const resampledAudioBuffer = await offlineContext.startRendering();
				// 	audioData = resampledAudioBuffer.getChannelData(0); // Get Float32Array for the mono channel
				// }

				// const arrayBuffer = await audioBlob.arrayBuffer();
				// const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
				// 	sampleRate: 16000 // Whisper expects 16kHz
				// });
				//
				// try {
				// 	const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
				//
				// 	// Convert to mono if stereo
				// 	let audioData;
				// 	if (audioBuffer.numberOfChannels === 1) {
				// 		audioData = audioBuffer.getChannelData(0);
				// 	} else {
				// 		// Mix down to mono
				// 		const left = audioBuffer.getChannelData(0);
				// 		const right = audioBuffer.getChannelData(1);
				// 		audioData = new Float32Array(left.length);
				// 		for (let i = 0; i < left.length; i++) {
				// 			audioData[i] = (left[i] + right[i]) / 2;
				// 		}
				// 	}
				//
				// 	// Resample to 16kHz if needed
				// 	if (audioBuffer.sampleRate !== 16000) {
				// 		const resampleRatio = audioBuffer.sampleRate / 16000;
				// 		const newLength = Math.floor(audioData.length / resampleRatio);
				// 		const resampledData = new Float32Array(newLength);
				//
				// 		for (let i = 0; i < newLength; i++) {
				// 			const srcIndex = Math.floor(i * resampleRatio);
				// 			resampledData[i] = audioData[srcIndex];
				// 		}
				//
				// 		audioData = resampledData;
				// 	}
				//
				const audioData = await Transcriber.blobToAudioData(audioBlob);
				const output = await transcriber(audioData, {
					top_k: 0,
					do_sample: false,
					chunk_length_s: 30, // Process in 30-second chunks
					stride_length_s: 5 // Overlap chunks by 5 seconds for better continuity
				});
				console.log('output', output);
				// 	return;
				// 	// return audioData;
				// } catch (error) {
				// 	console.error('Error processing audio:', error);
				// 	throw error;
				// }

				// showStatus('Transcribing...', 'processing');
				// Transcribe the audio
				// The `audioData` is a Float32Array of PCM data at 16kHz, mono
				// const url =
				// 	'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav';
				// const output = await transcriber(url, {
				// 	top_k: 0,
				// 	do_sample: false,
				// 	chunk_length_s: 30, // Process in 30-second chunks
				// 	stride_length_s: 5 // Overlap chunks by 5 seconds for better continuity
				// });
				// console.log('output', output);
				// // Convert blob to audio buffer
				// const arrayBuffer = await (audioBlob as any).arrayBuffer();
				// // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
				// const audioContext = new window.AudioContext();
				// const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
				//
				// // Convert to the format expected by the model
				// const audioData = audioBuffer.getChannelData(0);
				// // Transcribe the audio
				// const result = await transcriber(url);
				// console.log('result: ', result);

				// Update the transcript
				// const currentText = this.transcript.textContent;
				// const newText = result.text.trim();

				// if (newText && newText.length > 0) {
				// 	if (currentText === 'Your speech will appear here...') {
				// 		this.transcript.textContent = newText;
				// 	} else {
				// 		this.transcript.textContent = currentText + ' ' + newText;
				// 	}
				// }
				//
				// this.updateStatus('Ready! Click the microphone to speak again');
			});
		}
	};
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<button type="button" onclick={toggleRecording}
	>record{JSON.stringify(isRecording.valueOf())}</button
> <audio id="audio" controls src={audioUrl}></audio>
