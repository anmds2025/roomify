
interface IServiceData {
  name: string;
  image: string;
  describe : string;
}

const ServiceData: IServiceData[] = [
  {
    name: 'Quick Healing',
    image: 'img_article1.png',
    describe: 'The treatments focus on reducing tension and pain in sensitive areas'
  },
  {
    name: 'Bedding treatment',
    image: 'img_article2.png',
    describe: 'Restore balance, relieve stress, and enhance overall well-being wellness'
  },
  {
    name: 'Packages',
    image: 'img_article1.png',
    describe: 'Rejuvenate tired feet or indulge in a full-body renewal'
  },
  {
    name: 'Add-on service',
    image: 'img_article2.png',
    describe: 'Quick 30-mininute options to focus on particular areas'
  },
];

export { ServiceData, type IServiceData };
