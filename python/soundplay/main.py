import os
import subprocess
import pyaudio
from pydub import AudioSegment

# === 配置参数（直接修改这里） ===
FFMPEG_PATH = r"C:\Users\Administrator\TOOL\ffmpeg.exe"  # 替换为你的 ffmpeg.exe 路径
AUDIO_FILE = r"C:\Users\Administrator\PycharmProjects\electron-egg\data\audio\mp3.mp3" # 替换为你的音频文件路径
DEVICE_INDEX = 13                           # 替换为你的设备索引（见下方说明）

# === 1. 用 FFmpeg 解码 MP3 为 PCM ===
# 生成临时 WAV 文件（避免内存占用）
temp_wav = "temp.wav"
cmd = [
    FFMPEG_PATH,
    "-i", AUDIO_FILE,
    "-acodec", "pcm_s16le",  # 16位 PCM 格式
    "-ar", "48000",          # 采样率 44.1kHz
    "-ac", "2",              # 立体声
    temp_wav
]
subprocess.run(cmd, check=True, creationflags=subprocess.CREATE_NO_WINDOW)

# === 2. 用 PyAudio 播放到指定设备 ===
p = pyaudio.PyAudio()
stream = p.open(
    format=pyaudio.paInt16,
    channels=2,
    rate=48000,
    output=True,
    output_device_index=DEVICE_INDEX  # 关键：指定设备
)

# 读取 WAV 文件并播放
with open(temp_wav, "rb") as f:
    data = f.read(1024)
    while data:
        stream.write(data)
        data = f.read(1024)

# === 3. 清理资源 ===
stream.stop_stream()
stream.close()
p.terminate()
os.remove(temp_wav)  # 删除临时文件
print("播放完成！")