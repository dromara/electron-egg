import { webview } from '@kit.ArkWeb';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { router } from '@kit.ArkUI';

// 华为账号用户认证协议展示页
@Entry
@Component
export struct WebPage {
  @State webUrl?: string = '';
  @State progress: number = 0;
  logTag: string = 'WebPage';
  domainId: number = 0x0000;
  controller: webview.WebviewController = new webview.WebviewController();

  build() {
    Column() {
      Column() {
        Button({ type: ButtonType.Normal }) {
          Image($r('sys.media.ohos_ic_compnent_titlebar_back'))
            .backgroundColor(Color.Transparent)
            .borderRadius(20)
            .width(24)
            .height(24)
            .draggable(false)
            .autoResize(false)
            .focusable(true)
            .fillColor($r('sys.color.ohos_id_color_titlebar_icon'))
            .matchTextDirection(true)
        }
        .alignSelf(ItemAlign.Start)
        .backgroundColor($r('sys.color.ohos_id_color_button_normal'))
        .borderRadius(20)
        .width(40)
        .height(40)
        .onClick(() => {
          router.back();
        })
      }
      .height(56)
      .width('100%')
      .justifyContent(FlexAlign.Center)
      .margin({
        top: 36,
        left: 16
      })

      Progress({ value: this.progress, type: ProgressType.Linear })
        .width('100%')
        .visibility(this.progress <= 99 ? Visibility.Visible : Visibility.None)

      Web({ src: this.webUrl ?? '', controller: this.controller })
        .backgroundColor(Color.Transparent)
        .margin({ bottom: 60 })
        .onProgressChange((event) => {
          hilog.info(this.domainId, this.logTag,
            'onProgressChange: ', (event ? event.newProgress : -1));
          this.progress = event ? event.newProgress : 0;
        })
        .darkMode(WebDarkMode.Auto)
        .forceDarkAccess(true)
        .onLoadIntercept((event) => {
          hilog.info(this.domainId, this.logTag, 'onLoadIntercept');
          return false;
        })
        .onErrorReceive((event) => {
          if (event) {
            hilog.error(this.domainId, this.logTag, `onErrorReceive,errorInfo: ${event?.error?.getErrorInfo()}`);
          }
        })
    }
    .backgroundColor(0xffffff)
    .alignItems(HorizontalAlign.Start)
    .padding({ left: 12, right: 12, bottom: 60 })
    .width('100%')
    .height('100%')
  }

  aboutToAppear(): void {
    hilog.info(0x0000, 'testTag', 'aboutToAppear');
    const params = router.getParams() as Record<string, string>;
    this.webUrl = params.url ?? '';
    hilog.info(0x0000, 'testTag', `webUrl: ${this.webUrl}`);
  }

  aboutToDisappear(): void {
    hilog.info(0x0000, 'testTag', 'aboutToDisappear');
    if (this.webUrl) {
      this.controller.stop();
    }
  }
}