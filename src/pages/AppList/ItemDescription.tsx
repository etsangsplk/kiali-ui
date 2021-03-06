import * as React from 'react';
import { AppHealth } from '../../types/Health';
import { DisplayMode, HealthIndicator } from '../../components/Health/HealthIndicator';
import AppErrorRate from './AppErrorRate';
import { AppListItem } from '../../types/AppList';
import { CancelablePromise, makeCancelablePromise } from '../../utils/Common';

interface Props {
  item: AppListItem;
}
interface State {
  health?: AppHealth;
}

export default class ItemDescription extends React.PureComponent<Props, State> {
  private healthPromise?: CancelablePromise<AppHealth>;

  constructor(props: Props) {
    super(props);
    this.state = { health: undefined };
  }

  componentDidMount() {
    this.onItemChanged(this.props.item);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.item.healthPromise !== prevProps.item.healthPromise) {
      this.onItemChanged(this.props.item);
    }
  }

  componentWillUnmount() {
    if (this.healthPromise) {
      this.healthPromise.cancel();
      this.healthPromise = undefined;
    }
  }

  onItemChanged(item: AppListItem) {
    if (this.healthPromise) {
      this.healthPromise.cancel();
    }

    this.healthPromise = makeCancelablePromise(item.healthPromise);
    this.healthPromise.promise.then(h => this.setState({ health: h })).catch(err => {
      if (!err.isCanceled) {
        this.setState({ health: undefined });
      }
    });
  }

  render() {
    return this.state.health ? (
      <table style={{ width: '50em', tableLayout: 'fixed' }}>
        <tbody>
          <tr>
            <td>
              <strong>Health: </strong>
              <HealthIndicator id={this.props.item.name} health={this.state.health} mode={DisplayMode.SMALL} />
            </td>
            <td>
              <AppErrorRate requestHealth={this.state.health.requests} />
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    ) : (
      <span />
    );
  }
}
