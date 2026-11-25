import base64
import json
import os
import subprocess
import tempfile
import wave
from pathlib import Path

from jsonschema import Draft202012Validator


PRESSURE = [
    ("Пласт после пуска отбора", "Галерею запускают и поддерживают постоянный отбор. Давление в пласте меняется постепенно."),
    ("Граница на расчётной схеме", "В приближённом методе выделяют условную зону, внутри которой учитывают изменение давления."),
    ("Что изменится через большее время?", "Предскажи: если подождать в четыре раза дольше, во сколько раз вырастет длина зоны?"),
    ("Длина зоны вырастет вдвое", "При той же пьезопроводности длина зоны растёт как квадратный корень из времени. Четыре дают два."),
    ("Где начинается приближение", "Граница на рисунке условна. В точной модели изменение давления распределено плавно."),
    ("А если изменится порода?", "На перенос: что произойдёт с расчётной длиной, если время оставить прежним, а пьезопроводность изменить?"),
]
CROSSPLOT = [
    ("Пример из интерпретации ГИС", "Мы разберём пример Латышовой. Для него в книге дана палетка зависимости сопротивления от пористости."),
    ("Исходное измерение: сопротивление", "В условии задачи сопротивление равно двадцати ом-метрам. Это одно из двух значений."),
    ("Второй параметр: пористость", "Оценка пористости для того же интервала составляет двадцать пять процентов. Проверяем, что параметры относятся к одному интервалу."),
    ("Пористость на горизонтальной оси", "Найди значение пористости на горизонтальной оси. Проведи от отметки линию вверх."),
    ("Сопротивление на вертикальной оси", "Теперь найди сопротивление на вертикальной оси. Проведи от этого уровня линию вправо."),
    ("Одна точка, две координаты", "Пересечение линий обозначает точку с обеими координатами. Схема здесь показывает только ход построения точки."),
    ("Какой приток ожидает автор?", "Остановись и предскажи результат. Проверь, в какую область попадает точка на полной палетке книги."),
    ("Вывод из примера: безводная нефть", "Для этого случая Латышова прогнозирует безводную нефть при испытании. Так прочитана область на палетке автора."),
    ("Границы областей задаёт палетка", "Таким способом интерпретируют пару параметров. Границы областей зависят от условий, для которых построили палетку."),
    ("Что сохранять в данных?", "Сохрани оба значения, единицы, глубину и версию палетки. Тогда другой специалист сможет повторить принятое решение."),
    ("Проверь перенос на другой пласт", "На перенос: прежде чем взять ту же палетку для другого пласта, какие исходные условия и данные ты проверишь?"),
]


def captions_time(seconds):
    millis = round(seconds * 1000)
    return f"{millis//3600000:02}:{millis//60000%60:02}:{millis//1000%60:02}.{millis%1000:03}"


def render_media(docs, output, schema_path, ffmpeg, voice, allow_silent=False):
    from PIL import Image, ImageDraw, ImageFont
    node = next((item for item in docs["layer"]["nodes"] if item.get("media")), None)
    if node is None:
        return
    settings = node["media"]
    portrait = settings["orientation"] == "portrait"
    size = (540, 960) if portrait else (960, 540)
    lines = PRESSURE if portrait else CROSSPLOT
    directory = output / "media"
    directory.mkdir(parents=True, exist_ok=True)
    source = next((claim for claim in node["claims"] if claim["page_pdf"] == settings["sourcePage"]), node["claims"][0])
    titles = {
        "pressure":{"objects":["галерея","условная граница"],"state":{"kappa_m2_s":1,"t_s":[1,4]},"equation":"l = sqrt(2*kappa*t)",
                    "invariants":["При постоянной пьезопроводности четырёхкратный рост времени удваивает длину.","Граница условная."],
                    "assumptions":["галерея с постоянным отбором","схематический пространственный масштаб"]},
        "crossplot":{"objects":["оси","две направляющие","точка"],"state":{"porosity_percent":25,"resistivity_ohm_m":20},
                     "invariants":["точка на пересечении направляющих","обе координаты относятся к одному интервалу"],
                     "assumptions":["границы полей не воспроизведены","вывод приведён по авторскому примеру"]},
    }
    spec = {"node_id":node["id"],"canvas":size,"template":settings["template"],"fps":24,
            **titles[settings["template"]],"source_claim":source["id"],"source_page_pdf":source["page_pdf"]}
    font_root = Path(os.environ.get("WINDIR","C:/Windows")) / "Fonts"
    regular = str(font_root / "arial.ttf")
    bold = str(font_root / "arialbd.ttf")
    small = ImageFont.truetype(regular, 21)
    large = ImageFont.truetype(bold, 29 if portrait else 37)
    heading = ImageFont.truetype(bold, 20)
    width, height = size

    def frame(index, fraction):
        image=Image.new("RGB",size,"#132538")
        draw=ImageDraw.Draw(image)
        draw.text((32,25),"ROCKIGO  /  "+("СИМУЛЯЦИЯ" if portrait else "СХЕМА"),font=heading,fill="#86e4d1")
        draw.text((width-32,26),f"PDF {source['page_pdf']}",font=small,fill="#c2d5e9",anchor="ra")
        remaining=lines[index][0].split()
        y_title=76
        while remaining:
            line=remaining.pop(0)
            while remaining and draw.textlength(line+" "+remaining[0],font=large)<=width-64:
                line+=" "+remaining.pop(0)
            draw.text((32,y_title),line,font=large,fill="#ffffff")
            y_title+=large.size+5
        if portrait:
            origin, span = 78, width-155
            def segment(y,t,label):
                end=origin+span*(2*t)**.5/(8)**.5
                draw.line((origin,y,end,y),fill="#7ee0c9",width=9)
                draw.ellipse((end-7,y-7,end+7,y+7),fill="#ffd18c")
                draw.text((origin,y-52),label,font=small,fill="#eef5ff")
            draw.rounded_rectangle((32,210,width-32,727),radius=16,fill="#1b354d")
            draw.line((origin,282,origin,609),fill="#a9c4da",width=4)
            segment(400,1,"Первый момент")
            if index>=3:
                segment(567,1+3*fraction if index==3 else 4,"Вчетверо позже")
            draw.text((origin,655),"Галерея с постоянным отбором",font=small,fill="#dce9f8")
            draw.text((32,807),"Условная граница · не в масштабе",font=small,fill="#c2d5e9")
        else:
            ox,oy,right,top=150,419,873,161
            value=spec["state"]
            x=ox+(right-ox)*value["porosity_percent"]/40
            y=oy-(oy-top)*value["resistivity_ohm_m"]/35
            draw.rounded_rectangle((34,138,925,481),radius=16,fill="#1b354d")
            draw.line((ox,top,ox,oy,right,oy),width=3,fill="#dce9f7")
            draw.text((160,164),"Сопротивление, Ом·м",font=small,fill="#eaf5ff")
            draw.text((691,440),"Пористость, %",font=small,fill="#eaf5ff")
            if index>=3:
                draw.line((x,oy,x,y),width=4,fill="#7de2cb")
                draw.text((x,433),"25",font=small,fill="#eaf5ff",anchor="ma")
            if index>=4:
                draw.line((ox,y,x,y),width=4,fill="#7de2cb")
                draw.text((ox-15,y),"20",font=small,fill="#eaf5ff",anchor="rm")
            if index>=5:
                draw.ellipse((x-9,y-9,x+9,y+9),fill="#ffd18c")
            if index>=7:
                draw.multiline_text((x+24,y-23),"Прогноз автора\nБезводная нефть",font=small,fill="#ffd18c",spacing=5)
            draw.text((34,500),"Схема построения точки · границы полей опущены",font=small,fill="#c2d5e9")
        footer=f"{index+1:02} / {len(lines):02}"
        draw.text((width-33,height-28),footer,font=heading,fill="#86e4d1",anchor="ra")
        return image

    video_id=settings["template"]
    notes=[]; script=[]; frames=[]; position=0
    with tempfile.TemporaryDirectory(prefix="rockigo-video-") as temp:
        scratch=Path(temp)
        segments=[]
        for index,(caption,line) in enumerate(lines):
            wav=scratch/f"voice-{index}.wav"
            spoken=scratch/f"voice-{index}.txt"
            spoken.write_text(line,encoding="utf-8")
            try:
                subprocess.run([voice,"-NoProfile","-File",str(Path(__file__).with_name("narrate.ps1")),"-InputPath",str(spoken),"-OutputPath",str(wav)],check=True,capture_output=True)
            except (OSError,subprocess.CalledProcessError):
                if not allow_silent:
                    raise
                wav=None
            duration=0
            if wav:
                with wave.open(str(wav),"rb") as audio:
                    duration=audio.getnframes()/audio.getframerate()
            length=max(7 if portrait else 9,duration+(1.5 if index in {2 if portrait else 6} else .8))
            frames_count=round(length*24)
            length=frames_count/24
            segment=scratch/f"part-{index}.mp4"
            command=[ffmpeg,"-hide_banner","-loglevel","error","-y","-f","rawvideo","-pixel_format","rgb24",
                     "-video_size",f"{width}x{height}","-framerate","24","-i","pipe:0"]
            command+=["-i",str(wav)] if wav else ["-f","lavfi","-i","anullsrc=r=44100:cl=mono"]
            command+=["-af","apad","-t",str(length),"-ar","44100","-ac","1","-c:a","aac","-b:a","96k",
                      "-c:v","libx264","-threads","2","-pix_fmt","yuv420p","-preset","veryfast","-crf","22",str(segment)]
            proc=subprocess.Popen(command,stdin=subprocess.PIPE)
            if portrait and index==3:
                samples=[frame(index,i/12).tobytes() for i in range(13)]
            else:
                samples=[frame(index,1).tobytes()]
            with proc.stdin:
                for f in range(frames_count):
                    proc.stdin.write(samples[min(len(samples)-1,f*len(samples)//frames_count)])
            if proc.wait()!=0:
                raise RuntimeError(f"FFmpeg could not encode {video_id} segment {index}")
            segments.append(segment)
            word_end=round(position+(duration or length),2)
            script.append({"t_start":round(position,2),"t_end":word_end,"text":line,"claim_id":source["id"],"on_screen":caption})
            frames.append({"t":round(position,2),"class":"B" if portrait else "A","label":"симуляция" if portrait else "схема"})
            notes.append(f"{captions_time(position)} --> {captions_time(word_end)}\n{line}")
            position+=length
        concat=scratch/"segments.txt"
        concat.write_text("".join(f"file '{segment.as_posix()}'\n" for segment in segments),encoding="utf-8")
        video=directory/f"{video_id}.mp4"
        subprocess.run([ffmpeg,"-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(concat),
                        "-c:v","copy","-c:a","aac","-af","loudnorm=I=-16:TP=-1.5:LRA=11","-movflags","+faststart",str(video)],check=True)
    caption_text="WEBVTT\n\n"+"\n\n".join(notes)+"\n"
    (directory/f"{video_id}.vtt").write_text(caption_text,encoding="utf-8")
    spec_name=f"{video_id}.scene.json"
    passport_name=f"{video_id}.passport.json"
    (directory/spec_name).write_text(json.dumps(spec,ensure_ascii=False,indent=2),encoding="utf-8")
    passport={"video_id":video_id,"node_id":node["id"],"node_card":{"title":node["title"],"pages":node["pages"],"difficulty":node["difficulty"]},
              "script":script,"sources":[{"claim_id":source["id"],"page_or_dataset":f"PDF {source['page_pdf']}","quote":source["quote"]}],
              "scene_spec":spec_name,"frames":frames,"exaggerations":["Геометрические расстояния показаны схематически."] if portrait else [],
              "prediction_question":lines[2 if portrait else 6][1],"transfer_question":lines[-1][1],
              "data_it_bridge":"Время и пьезопроводность задают расчётную длину." if portrait else "Пористость, сопротивление, глубина и версия палетки нужны для повторения интерпретации.",
              "physics_checklist":[{"item":"Формула и входные данные воспроизводятся кодом","answer":"да","note":"По спецификации сцены."},
                                   {"item":"Предметная проверка у ментора","answer":"н/п","note":"Подтверждение ментора не получено."}],
              "audio_check":{"engine":"Microsoft Irina Desktop" if wav else "нет дорожки","target_lufs":-16,"speech_recognition_checked":False,"duration_seconds":round(position,2)}}
    Draft202012Validator(json.loads(schema_path.read_text(encoding="utf-8-sig"))).validate(passport)
    (directory/passport_name).write_text(json.dumps(passport,ensure_ascii=False,indent=2),encoding="utf-8")
    settings.update(file="media/"+video.name,captions="data:text/vtt;base64,"+base64.b64encode(caption_text.encode("utf-8")).decode(),
                    passport="media/"+passport_name,specification="media/"+spec_name)
