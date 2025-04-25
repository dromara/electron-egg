import pyaudio

def list_available_output_devices():
    p = pyaudio.PyAudio()
    print("可用音频输出设备:")
    
    for i in range(p.get_device_count()):
        try:
            dev = p.get_device_info_by_index(i)
            # 检查设备是否支持输出、默认采样率是否有效，以及是否未被禁用
            if (dev["maxOutputChannels"] > 0 and 
                dev["defaultSampleRate"] > 0 and
                not dev["name"].startswith('禁用')):
                
                # 测试设备是否真的可用
                try:
                    test_stream = p.open(
                        format=pyaudio.paInt16,
                        channels=min(2, dev["maxOutputChannels"]),
                        rate=int(dev["defaultSampleRate"]),
                        output=True,
                        output_device_index=i,
                        frames_per_buffer=1024
                    )
                    test_stream.close()
                    print(f"Index: {i}, Name: {dev['name']} (声道: {dev['maxOutputChannels']}, 采样率: {int(dev['defaultSampleRate'])})")
                except:
                    continue
                    
        except:
            continue
            
    p.terminate()

# 执行函数
list_available_output_devices()