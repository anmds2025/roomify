
interface IDetailService {
  name: string;
  treatment: string;
  price: string;
  describe : string;
}

const DetailServiceData: IDetailService[] = [
  {
    name: 'ROOTED - FOOT REFLEXOLOGY',
    treatment: '30/60/90',
    price: '300.000/420.000/600.000',
    describe: 'Ground yourself with our seated foot treatment Benefits: Relieves stress and pain of the lower legs and stimulates emotional, physical and mental healing. Warming and renewing. '
  },
  {
    name: 'LEAF - HEAD, SHOULDER, NECK TREATMENT',
    treatment: '30/60',
    price: '270.000/400.000',
    describe: 'Benefits: Relieves head, neck, facial and shoulder tension. Relax and recharge. Increased sense of renewal.'
  },
  {
    name: 'BLOOM - HEAD, SHOULDER, NECK AND FOOT TREATMENT',
    treatment: '75/90',
    price: '550.000/660.000',
    describe: 'Benefits: Relieves neck, head, shoulder, facial and foot tension. Restores sense of well-being throughout and rejuvenates and restores mental clarity. Uplifting.'
  },  
];

export { DetailServiceData, type IDetailService };
