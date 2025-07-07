import Quill from 'quill';

const Image = Quill.import('formats/image');

class CustomImageBlot extends Image {
  static create(value: string) {
    let node = super.create(value);
    node.setAttribute('style', 'max-width: 100%; height: auto;'); 
    return node;
  }

  static value(node: HTMLDivElement) {
    return node.getAttribute('src');
  }
}

export default CustomImageBlot;
