import Quill from 'quill';

const Embed = Quill.import('blots/embed');

class VideoBlot extends Embed {
  static create(value: string) {
    let node = super.create(value);
    node.setAttribute('src', value);
    node.setAttribute('frameborder', '0');
    node.setAttribute('allowfullscreen', 'true');
    node.setAttribute('width', '100%'); 
    node.setAttribute('height', 'auto');
    return node;
  }

  static value(node: HTMLDivElement) {
    return node.getAttribute('src');
  }
}

export default VideoBlot;
