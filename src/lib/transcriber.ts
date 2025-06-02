class Transcriber {
	// static isRecording =
	static mediaRecorder: MediaRecorder;
	static async startRecording(): Promise<Blob> {
		return new Promise(async (resolve, reject) => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: {
						sampleRate: 16000,
						channelCount: 1
					}
				});

				Transcriber.mediaRecorder = new MediaRecorder(stream, {
					mimeType: 'audio/webm;codecs=opus'
				});
				const audioChunks: Blob[] = [];

				Transcriber.mediaRecorder.ondataavailable = (event) => {
					if (event.data.size > 0) {
						audioChunks.push(event.data);
					}
				};

				Transcriber.mediaRecorder.onstop = async () => {
					const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
					// await this.processAudio(audioBlob);
					// return audioBlob;
					resolve(audioBlob);
				};

				Transcriber.mediaRecorder.start();
				// isRecording = true;
				// micButton.classList.add('recording');
				// updateStatus('🔴 Recording... Click again to stop');
			} catch (error) {
				console.error('Error starting recording:', error);
				// this.updateStatus('Error accessing microphone. Please allow microphone access.', true);
				reject(error);
			}
		});
	}

	static stopRecording() {
		if (Transcriber.mediaRecorder) {
			Transcriber.mediaRecorder.stop();
			Transcriber.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
		}
	}

	static async blobToAudioData(blob: Blob) {
		const arrayBuffer = await blob.arrayBuffer();
		const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
			sampleRate: 16000 // Whisper expects 16kHz
		});

		try {
			const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

			// Convert to mono if stereo
			let audioData;
			if (audioBuffer.numberOfChannels === 1) {
				audioData = audioBuffer.getChannelData(0);
			} else {
				// Mix down to mono
				const left = audioBuffer.getChannelData(0);
				const right = audioBuffer.getChannelData(1);
				audioData = new Float32Array(left.length);
				for (let i = 0; i < left.length; i++) {
					audioData[i] = (left[i] + right[i]) / 2;
				}
			}

			// Resample to 16kHz if needed
			if (audioBuffer.sampleRate !== 16000) {
				const resampleRatio = audioBuffer.sampleRate / 16000;
				const newLength = Math.floor(audioData.length / resampleRatio);
				const resampledData = new Float32Array(newLength);

				for (let i = 0; i < newLength; i++) {
					const srcIndex = Math.floor(i * resampleRatio);
					resampledData[i] = audioData[srcIndex];
				}

				audioData = resampledData;
			}

			return audioData;
		} catch (error) {
			console.error('Error processing audio:', error);
			throw error;
		}
	}
}

export default Transcriber;
