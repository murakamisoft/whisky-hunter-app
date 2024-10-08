import React, { useState } from 'react';
import '../css/style.css'; // スタイルシートのインポート
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrapのインポート

const WhiskySearch = () => {
  const [auctionData, setAuctionData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // ローディング状態の追加

  // フィルター用のステート
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minBid, setMinBid] = useState('');
  const [maxBid, setMaxBid] = useState('');

  const convertToYen = (amount) => {
    const exchangeRate = 150; // 1ドルあたりの円のレート
    return (amount * exchangeRate).toLocaleString(); // カンマ区切りで返す
  };

  const handleSearch = async () => {
    setLoading(true); // ローディング開始
    setError(null); // エラーをリセット
    try {
      const response = await fetch('/api/auctions_data', {
        headers: {
          'accept': 'application/json',
          'X-CSRFToken': 'LxKMJM49SK7ZNR2pbGnVOW7WIDyo5An8B5OuuqHsFHjWC9oBScs9wkS5gqfnpqZx'
        }
      });
      if (!response.ok) {
        throw new Error('ネットワークエラー: データを取得できませんでした。');
      }
      const data = await response.json();
      // フィルタリング
      const filteredData = data.filter(auction => {
        const auctionDate = new Date(auction.dt);
        const minBidCheck = minBid ? auction.winning_bid_max >= minBid / 150 : true;
        const maxBidCheck = maxBid ? auction.winning_bid_min <= maxBid / 150 : true;

        return (
          (!startDate || auctionDate >= new Date(startDate)) &&
          (!endDate || auctionDate <= new Date(endDate)) &&
          minBidCheck &&
          maxBidCheck
        );
      });
      setAuctionData(filteredData); // データを状態に保存
    } catch (error) {
      setError(error.message);
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false); // ローディング終了
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center text-white" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '10px' }}>
        ウイスキーオークション情報
      </h1>

      <div className="text-center mb-3">
        <div className="form-inline justify-content-center mb-3">
          <input
            type="date"
            className="form-control mr-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="form-control mr-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <input
            type="number"
            className="form-control mr-2"
            placeholder="最小入札額"
            value={minBid}
            onChange={(e) => setMinBid(e.target.value)}
          />
          <input
            type="number"
            className="form-control mr-2"
            placeholder="最大入札額"
            value={maxBid}
            onChange={(e) => setMaxBid(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
            オークションを検索
          </button>
        </div>
      </div>

      {loading && <p className="text-center">読み込み中...</p>} {/* ローディングメッセージ */}
      {error && <p className="text-center text-danger">エラー: {error}</p>}
      {auctionData.length > 0 ? (
        <div className="row">
          {auctionData.map((auction) => (
            <div className="col-md-4 mb-4" key={`${auction.auction_slug}-${auction.dt}`}>
              <div className="card border-info">
                <div className="card-body">
                  <h5 className="card-title">{auction.auction_name} - {auction.dt}</h5>
                  <p className="card-text">最大入札額: ¥{convertToYen(auction.winning_bid_max)}</p>
                  <p className="card-text">最小入札額: ¥{convertToYen(auction.winning_bid_min)}</p>
                  <p className="card-text">平均入札額: ¥{convertToYen(auction.winning_bid_mean)}</p>
                  <p className="card-text">取引量: ¥{convertToYen(auction.auction_trading_volume)}</p>
                  <p className="card-text">ロット数: {auction.auction_lots_count}</p>
                  <p className="card-text">全オークションロット数: {auction.all_auctions_lots_count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="text-center">結果は見つかりませんでした。</p> // ローディング中は結果メッセージを表示しない
      )}
    </div>
  );
};

export default WhiskySearch;
